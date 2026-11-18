"use client"
import React, { useState, useCallback, useMemo, memo } from 'react'
import { useRouter } from "next/navigation"
import { useForm } from 'react-hook-form'
import { useAuth } from '@/lib/AuthContext'
import { 
  IoCalendarOutline, 
  IoBookOutline, 
  IoAnalyticsOutline, 
  IoSparklesOutline, 
  IoCopyOutline, 
  IoCheckmarkOutline, 
  IoArrowForwardOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

// Constant outside component — never reallocated on re-render
const PRESETS = [
  { id: '7d', label: '7 Days' },
  { id: '14d', label: '14 Days' },
  { id: '30d', label: '30 Days' },
  { id: 'month', label: 'Month' },
]

// Simple in-memory cache for lifestyle analysis results
const lifestyleCache = new Map()

function generateCacheKey(startDate, endDate, mode, length, theme) {
  return `${startDate}|${endDate}|${mode}|${length}|${theme}`
}

const AccountDetails = memo(function AccountDetails() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const displayName = profile?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Writer')

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      startDate: (() => {
        const d = new Date()
        d.setDate(d.getDate() - 7)
        return d.toISOString().split('T')[0]
      })(),
      endDate: new Date().toISOString().split('T')[0],
      mode: 'feedback',
      length: 'medium',
      theme: '',
    }
  })

  const startDate = watch('startDate')
  const endDate = watch('endDate')
  const mode = watch('mode')
  const length = watch('length')
  const theme = watch('theme')

  const [activePreset, setActivePreset] = useState('7d')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [journalCount, setJournalCount] = useState(0)

  // Sync date inputs when preset is clicked
  const handlePresetClick = useCallback((preset) => {
    setActivePreset(preset)
    const today = new Date()
    let start = new Date()

    if (preset === '7d') {
      start.setDate(today.getDate() - 7)
    } else if (preset === '14d') {
      start.setDate(today.getDate() - 14)
    } else if (preset === '30d') {
      start.setDate(today.getDate() - 30)
    } else if (preset === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1)
    }

    setValue('startDate', start.toISOString().split('T')[0])
    setValue('endDate', today.toISOString().split('T')[0])
  }, [setValue])

  const handleWriteEntry = useCallback(() => {
    router.push('/journal')
  }, [router])

  const onGenerateSubmit = useCallback(async (formData) => {
    const sDate = formData.startDate
    const eDate = formData.endDate
    const fMode = formData.mode
    const fLength = formData.length
    const fTheme = formData.theme

    const cacheKey = generateCacheKey(sDate, eDate, fMode, fLength, fTheme)
    const cached = lifestyleCache.get(cacheKey)
    if (cached) {
      setResult(cached.result)
      setJournalCount(cached.journalCount || 0)
      return
    }

    setLoading(true)
    setErrorMsg(null)
    setResult(null)
    setCopied(false)

    try {
      const response = await fetch('/api/journals/lifestyle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: sDate,
          endDate: eDate,
          mode: fMode,
          length: fLength,
          theme: fTheme,
          userId: user?.uid,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate lifestyle insights.')
      }

      if (data.success === false && data.code === 'NO_JOURNALS') {
        setErrorMsg('We couldn\'t find any journal entries during this period. Try selecting a different timeframe or start writing more journals!')
        setJournalCount(0)
      } else {
        setResult(data.result)
        setJournalCount(data.journalCount || 0)
        lifestyleCache.set(cacheKey, { result: data.result, journalCount: data.journalCount || 0 })
      }
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'An unexpected error occurred while communicating with the AI. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  const handleCopy = useCallback(() => {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [result])

  // Render markdown — memoized so it only runs when `result` changes
  const renderFormattedText = useCallback((text) => {
    if (!text) return null
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-md font-bold text-sepia mt-4 mb-2 font-display">{line.replace('### ', '')}</h4>
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-lg font-bold text-sepia mt-5 mb-2 font-display">{line.replace('## ', '')}</h3>
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="text-xl font-bold text-ink mt-6 mb-3 font-display">{line.replace('# ', '')}</h2>
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={idx} className="text-ink ml-4 list-disc my-1">{line.replace(/^[-*]\s+/, '')}</li>
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2.5" />
      }
      return <p key={idx} className="text-ink leading-relaxed text-sm md:text-base my-2">{line}</p>
    })
  }, [])

  // Memoize the rendered output — only re-render when result text changes
  const renderedOutput = useMemo(() => renderFormattedText(result), [result, renderFormattedText])

  return (
    <div className="w-full flex-1 flex flex-col gap-6 px-4 md:px-10 py-6 pb-8 bg-paper min-h-full text-ink">
      {/* 1. Dashboard Greeting Header */}
      <div className="card-vintage p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-sepia blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <span className="eyebrow">The Writer&rsquo;s Desk</span>
          <h1 className="text-2xl md:text-3xl font-display font-black text-ink tracking-tight flex items-center gap-2 mt-1">
            Welcome back, <span className="text-terracotta">{displayName}</span>
          </h1>
        </div>
        <button
          onClick={handleWriteEntry}
          className="btn-vintage relative z-10 self-stretch md:self-auto justify-center text-sm md:text-base cursor-pointer"
        >
          <IoBookOutline size={18} />
          Write a new entry
          <IoArrowForwardOutline size={16} />
        </button>
      </div>

      {/* 2. Main Interface Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Parameters Form */}
        <form onSubmit={handleSubmit(onGenerateSubmit)} className="lg:col-span-5 card-vintage p-5 md:p-6 flex flex-col gap-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-sepia/15">
            <div className="p-2 rounded-md bg-sepia/10 text-sepia">
              <IoSparklesOutline size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink font-display">Lifestyle Insights</h2>
              <p className="text-xs text-ink-soft font-body">Synthesize your journal data into stories or feedback</p>
            </div>
          </div>

          {/* Time range parameters */}
          <div className="flex flex-col gap-2">
            <label className="eyebrow flex items-center gap-1.5">
              <IoCalendarOutline size={14} /> Time Period
            </label>
            {/* Presets Row */}
            <div className="grid grid-cols-4 gap-1.5 mt-1" role="group" aria-label="Time period presets">
              {PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handlePresetClick(p.id)}
                  className={`text-[11px] md:text-xs font-bold py-1.5 px-1 rounded-md transition-all border cursor-pointer ${
                    activePreset === p.id
                      ? 'bg-sepia/15 text-sepia border-sepia/40'
                      : 'bg-transparent text-ink-soft hover:text-sepia hover:bg-vellum'
                  }`}
                  aria-pressed={activePreset === p.id}
                  aria-label={`Set time period to ${p.label}`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom Dates Inputs */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="start-date" className="text-[10px] text-ink-soft font-bold uppercase tracking-widest">
                  Start Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  {...register('startDate', { onChange: () => setActivePreset('custom') })}
                  className="input-vintage text-xs md:text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="end-date" className="text-[10px] text-ink-soft font-bold uppercase tracking-widest">
                  End Date
                </label>
                <input
                  id="end-date"
                  type="date"
                  {...register('endDate', { onChange: () => setActivePreset('custom') })}
                  className="input-vintage text-xs md:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Mode parameters */}
          <div className="flex flex-col gap-2.5">
            <label className="eyebrow flex items-center gap-1.5">
              <IoAnalyticsOutline size={14} /> Output Format
            </label>
            <div className="grid grid-cols-2 gap-3" role="group" aria-label="Output format">
              {/* Feedback Button */}
              <button
                type="button"
                onClick={() => setValue('mode', 'feedback')}
                className={`flex flex-col items-start gap-1 p-3 rounded-md border text-left transition-all cursor-pointer ${
                  mode === 'feedback'
                    ? 'bg-sepia/10 text-sepia border-sepia/40'
                    : 'bg-transparent text-ink-soft hover:text-sepia hover:bg-vellum'
                }`}
                aria-pressed={mode === 'feedback'}
                aria-label="Select feedback-based analysis format"
              >
                <span className="text-xs font-bold flex items-center gap-1 font-body">
                  <IoAnalyticsOutline size={12} aria-hidden="true" /> Feedback-Based
                </span>
                <span className="text-[9px] text-ink-soft leading-normal">
                  Analytical habits, productivity metrics, and cognitive feedback.
                </span>
              </button>

              {/* Story Button */}
              <button
                type="button"
                onClick={() => setValue('mode', 'story')}
                className={`flex flex-col items-start gap-1 p-3 rounded-md border text-left transition-all cursor-pointer ${
                  mode === 'story'
                    ? 'bg-teal/10 text-teal-deep border-teal/40'
                    : 'bg-transparent text-ink-soft hover:text-teal-deep hover:bg-vellum'
                }`}
                aria-pressed={mode === 'story'}
                aria-label="Select story format"
              >
                <span className="text-xs font-bold flex items-center gap-1 font-body">
                  <IoSparklesOutline size={12} aria-hidden="true" /> Story Form
                </span>
                <span className="text-[9px] text-ink-soft leading-normal">
                  Turn journal timelines into structured daily narrative stories.
                </span>
              </button>
            </div>
          </div>

          {/* Length parameters */}
          <div className="flex flex-col gap-2">
            <label className="eyebrow">Length of Output</label>
            <div className="grid grid-cols-3 gap-2 mt-1" role="group" aria-label="Output length">
              {['short', 'medium', 'long'].map((l) => (
                <button
                  type="button"
                  key={l}
                  onClick={() => setValue('length', l)}
                  className={`text-xs font-bold py-2 rounded-md transition-all border capitalize cursor-pointer font-body ${
                    length === l
                      ? 'bg-ink text-parchment border-ink'
                      : 'bg-transparent text-ink-soft hover:text-ink hover:bg-vellum'
                  }`}
                  aria-pressed={length === l}
                  aria-label={`Set output length to ${l}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Theme parameters */}
          <div className="flex flex-col gap-2">
            <label htmlFor="focus-theme" className="eyebrow">
              One-liner Focus Theme
            </label>
            <input
              id="focus-theme"
              type="text"
              {...register('theme')}
              placeholder="e.g. Work stress, family ties, school exams, fitness..."
              className="input-vintage text-xs md:text-sm"
            />
            <p className="text-[10px] text-ink-soft font-body">
              The AI will craft the story or analysis around this specific element of your life.
            </p>
          </div>

          {/* Generate Action */}
          <button
            type="submit"
            disabled={loading}
            className="btn-vintage w-full cursor-pointer disabled:cursor-not-allowed text-xs md:text-sm"
            aria-label={loading ? 'Generating insights, please wait' : 'Generate lifestyle insights'}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-parchment/40 border-t-parchment rounded-full animate-spin" />
                Reading Journals &amp; Writing...
              </>
            ) : (
              <>
                <IoSparklesOutline size={16} />
                Generate Lifestyle Insights
              </>
            )}
          </button>
        </form>

        {/* Right Side: Analysis Output Display */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[400px]">
          {/* Unloaded State */}
          {!loading && !result && !errorMsg && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 card-vintage text-center min-h-[400px]">
              <div className="w-12 h-12 rounded-md bg-sepia/10 text-sepia flex items-center justify-center mb-4">
                <IoSparklesOutline size={24} />
              </div>
              <h3 className="text-base md:text-lg font-bold text-ink font-display">Your Insights Will Appear Here</h3>
              <p className="text-ink-soft font-body text-xs md:text-sm mt-2 max-w-sm">
                Set your date range, pick story or feedback format, select your length and focus theme, and hit the generate button above!
              </p>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="flex-1 card-vintage p-6 md:p-8 flex flex-col gap-4 min-h-[400px]">
              <div className="flex items-center justify-between pb-4 border-b border-sepia/15">
                <div className="h-6 w-48 bg-vellum rounded-md" />
                <div className="h-5 w-24 bg-vellum rounded-md" />
              </div>
              <div className="space-y-3 mt-4">
                <div className="h-4 w-full bg-vellum rounded" />
                <div className="h-4 w-5/6 bg-vellum rounded" />
                <div className="h-4 w-4/5 bg-vellum rounded" />
                <div className="h-4 w-full bg-vellum rounded" />
                <div className="h-4 w-3/4 bg-vellum rounded" />
              </div>
              <div className="space-y-3 mt-6">
                <div className="h-4 w-full bg-vellum rounded" />
                <div className="h-4 w-5/6 bg-vellum rounded" />
                <div className="h-4 w-2/3 bg-vellum rounded" />
              </div>
            </div>
          )}

          {/* Error Notice */}
          {errorMsg && (
            <div className="flex-1 bg-brick/5 border border-brick/30 rounded-[10px] p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
              <div className="p-3 rounded-md bg-brick/10 text-brick">
                <IoInformationCircleOutline size={28} />
              </div>
              <h3 className="text-base font-bold text-ink font-display">No Journals Found or Analysis Failed</h3>
              <p className="text-brick text-xs md:text-sm max-w-md leading-relaxed font-body">
                {errorMsg}
              </p>
              <button
                onClick={handleWriteEntry}
                className="btn-outline mt-2 text-xs md:text-sm cursor-pointer"
                aria-label="Go write a journal entry"
              >
                Go write a journal entry
              </button>
            </div>
          )}

          {/* Generated Result Output */}
          {result && (
            <div className="flex-1 card-vintage flex flex-col overflow-hidden min-h-[400px]">
              {/* Output Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-sepia/15 bg-vellum">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-sepia/10 text-sepia">
                    {mode === 'feedback' ? <IoAnalyticsOutline size={16} /> : <IoSparklesOutline size={16} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-ink font-display">
                      {mode === 'feedback' ? 'AI Lifestyle Analysis' : 'Your Personal Life Story'}
                    </h3>
                    <p className="text-[10px] text-ink-soft font-medium">
                      Based on {journalCount} journal {journalCount === 1 ? 'entry' : 'entries'}
                    </p>
                  </div>
                </div>

                {/* Copy button */}
                <button
                  onClick={handleCopy}
                  className="btn-outline px-3 py-1.5 text-xs cursor-pointer"
                  aria-label={copied ? 'Copied to clipboard' : 'Copy text to clipboard'}
                >
                  {copied ? (
                    <>
                      <IoCheckmarkOutline size={14} className="text-sage" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <IoCopyOutline size={14} />
                      Copy Text
                    </>
                  )}
                </button>
              </div>

              {/* Output Body */}
              <div className="flex-grow p-6 overflow-y-auto max-h-[500px] bg-parchment">
                {renderedOutput}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

export default AccountDetails