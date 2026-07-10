"use client"
import React, { useState, useCallback, useMemo, memo } from 'react'
import { useRouter } from "next/navigation"
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

const AccountDetails = memo(function AccountDetails({ email }) {
  const router = useRouter()
  
  // Date states initialized to a 7-day range by default
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  const [activePreset, setActivePreset] = useState('7d')
  const [mode, setMode] = useState('feedback') // 'feedback' | 'story'
  const [length, setLength] = useState('medium') // 'short' | 'medium' | 'long'
  const [theme, setTheme] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [journalCount, setJournalCount] = useState(0)

  const displayName = email ? email.split('@')[0] : 'Writer'

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

    setStartDate(start.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
  }, [])

  // Trigger custom dates input changes
  const handleDateChange = useCallback((type, val) => {
    setActivePreset('custom')
    if (type === 'start') {
      setStartDate(val)
    } else {
      setEndDate(val)
    }
  }, [])

  const handleWriteEntry = useCallback(() => {
    router.push('/journal')
  }, [router])

  const handleGenerate = useCallback(async () => {
    const cacheKey = generateCacheKey(startDate, endDate, mode, length, theme)
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
          startDate,
          endDate,
          mode,
          length,
          theme
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
        // Cache successful results
        lifestyleCache.set(cacheKey, { result: data.result, journalCount: data.journalCount || 0 })
      }
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'An unexpected error occurred while communicating with the AI. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, mode, length, theme])

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
        return <h4 key={idx} className="text-md font-bold text-indigo-300 mt-4 mb-2">{line.replace('### ', '')}</h4>
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-lg font-bold text-indigo-400 mt-5 mb-2">{line.replace('## ', '')}</h3>
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="text-xl font-bold text-white mt-6 mb-3">{line.replace('# ', '')}</h2>
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={idx} className="text-slate-300 ml-4 list-disc my-1">{line.replace(/^[-*]\s+/, '')}</li>
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2.5" />
      }
      return <p key={idx} className="text-slate-300 leading-relaxed text-sm md:text-base my-2">{line}</p>
    })
  }, [])

  // Memoize the rendered output — only re-render when result text changes
  const renderedOutput = useMemo(() => renderFormattedText(result), [result, renderFormattedText])

  return (
    <div className="w-full flex-1 flex flex-col gap-6 px-4 md:px-10 py-6 bg-gray-950 min-h-screen text-slate-100 pb-24 md:pb-8">
      {/* 1. Dashboard Greeting Header */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-950 border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl backdrop-blur-md">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Welcome back, <span className="text-indigo-400 capitalize">{displayName}</span>!
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl">
            "Your life is a compilation of stories waiting to be analyzed, felt, and remembered." Start by writing a new entry or review your habits.
          </p>
        </div>
        <button
          onClick={handleWriteEntry}
          className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] cursor-pointer hover:shadow-indigo-500/35 self-stretch md:self-auto justify-center text-sm md:text-base"
        >
          <IoBookOutline size={18} />
          Write a new entry
          <IoArrowForwardOutline size={16} />
        </button>
      </div>

      {/* 2. Main Interface Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Parameters Form */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-md flex flex-col gap-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <IoSparklesOutline size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Lifestyle Insights</h2>
              <p className="text-xs text-slate-400">Synthesize your journal data into stories or feedback</p>
            </div>
          </div>

          {/* Time range parameters */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <IoCalendarOutline size={14} /> Time Period
            </label>
            {/* Presets Row */}
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePresetClick(p.id)}
                  className={`text-[11px] md:text-xs font-semibold py-1.5 px-1 rounded-lg transition-all border cursor-pointer ${
                    activePreset === p.id
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-transparent text-slate-400 border-white/5 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom Dates Inputs */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-medium">Start Date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 [color-scheme:dark]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-medium">End Date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Mode parameters */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <IoAnalyticsOutline size={14} /> Output Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Feedback Button */}
              <button
                onClick={() => setMode('feedback')}
                className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  mode === 'feedback'
                    ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/40'
                    : 'bg-transparent text-slate-400 border-white/5 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-xs font-bold flex items-center gap-1">
                  <IoAnalyticsOutline size={12} /> Feedback-Based
                </span>
                <span className="text-[9px] text-slate-500 leading-normal">
                  Analytical habits, productivity metrics, and cognitive feedback.
                </span>
              </button>

              {/* Story Button */}
              <button
                onClick={() => setMode('story')}
                className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  mode === 'story'
                    ? 'bg-purple-500/10 text-purple-300 border-purple-500/40'
                    : 'bg-transparent text-slate-400 border-white/5 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-xs font-bold flex items-center gap-1">
                  <IoSparklesOutline size={12} /> Story Form
                </span>
                <span className="text-[9px] text-slate-500 leading-normal">
                  Turn journal timelines into structured daily narrative stories.
                </span>
              </button>
            </div>
          </div>

          {/* Length parameters */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              Length of Output
            </label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {['short', 'medium', 'long'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={`text-xs font-semibold py-2 rounded-xl transition-all border capitalize cursor-pointer ${
                    length === l
                      ? 'bg-white/10 text-white border-white/30'
                      : 'bg-transparent text-slate-400 border-white/5 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Theme parameters */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              One-liner Focus Theme
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. Work stress, family ties, school exams, fitness..."
              className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 text-xs md:text-sm"
            />
            <p className="text-[10px] text-slate-500">
              The AI will craft the story or analysis around this specific element of your life.
            </p>
          </div>

          {/* Generate Action */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm active:scale-[0.98]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Reading Journals & Writing...
              </>
            ) : (
              <>
                <IoSparklesOutline size={16} />
                Generate Lifestyle Insights
              </>
            )}
          </button>
        </div>

        {/* Right Side: Analysis Output Display */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[400px]">
          {/* Unloaded State */}
          {!loading && !result && !errorMsg && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/5 border border-white/5 border-dashed rounded-3xl text-center backdrop-blur-sm min-h-[400px]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                <IoSparklesOutline size={24} className="opacity-80" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-white">Your Insights Will Appear Here</h3>
              <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-sm">
                Set your date range, pick story or feedback format, select your length and focus theme, and hit the generate button above!
              </p>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-4 shadow-2xl min-h-[400px]">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="h-6 w-48 bg-slate-800 rounded-lg" />
                <div className="h-5 w-24 bg-slate-800 rounded-lg" />
              </div>
              <div className="space-y-3 mt-4">
                <div className="h-4 w-full bg-slate-800 rounded" />
                <div className="h-4 w-5/6 bg-slate-800 rounded" />
                <div className="h-4 w-4/5 bg-slate-800 rounded" />
                <div className="h-4 w-full bg-slate-800 rounded" />
                <div className="h-4 w-3/4 bg-slate-800 rounded" />
              </div>
              <div className="space-y-3 mt-6">
                <div className="h-4 w-full bg-slate-800 rounded" />
                <div className="h-4 w-5/6 bg-slate-800 rounded" />
                <div className="h-4 w-2/3 bg-slate-800 rounded" />
              </div>
            </div>
          )}

          {/* Error Notice */}
          {errorMsg && (
            <div className="flex-1 bg-red-950/20 border border-red-500/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
              <div className="p-3 rounded-2xl bg-red-500/10 text-red-400">
                <IoInformationCircleOutline size={28} />
              </div>
              <h3 className="text-base font-bold text-white">No Journals Found or Analysis Failed</h3>
              <p className="text-red-300/80 text-xs md:text-sm max-w-md leading-relaxed">
                {errorMsg}
              </p>
              <button 
                onClick={handleWriteEntry}
                className="mt-2 text-xs md:text-sm font-semibold bg-white/10 hover:bg-white/15 text-white py-2 px-5 rounded-xl border border-white/10 transition-all cursor-pointer"
              >
                Go write a journal entry
              </button>
            </div>
          )}

          {/* Generated Result Output */}
          {result && (
            <div className="flex-1 bg-gradient-to-b from-indigo-950/10 to-transparent border border-indigo-500/20 rounded-3xl flex flex-col shadow-2xl overflow-hidden min-h-[400px]">
              {/* Output Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-500/20 bg-indigo-950/20 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    {mode === 'feedback' ? <IoAnalyticsOutline size={16} /> : <IoSparklesOutline size={16} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      {mode === 'feedback' ? 'AI Lifestyle Analysis' : 'Your Personal Life Story'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Based on {journalCount} journal {journalCount === 1 ? 'entry' : 'entries'}
                    </p>
                  </div>
                </div>

                {/* Copy button */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                >
                  {copied ? (
                    <>
                      <IoCheckmarkOutline size={14} className="text-emerald-400" />
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
              <div className="flex-grow p-6 overflow-y-auto max-h-[500px] custom-scrollbar bg-slate-950/45">
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
