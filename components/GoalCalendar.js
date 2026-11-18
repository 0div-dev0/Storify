'use client'

import { useState, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useData } from '@/lib/DataContext'
import { useAuth } from '@/lib/AuthContext'

// Stable helper outside component — never redefined per render
function formatDateLocal(date) {
  if (!date) return ''
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function GoalCalendar() {
  const { goals, journals, dayStatuses, loading, refresh } = useData()
  const { user } = useAuth()
  const [analyzing, setAnalyzing] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())

  const {
    register: registerGoal,
    handleSubmit: handleGoalSubmit,
    reset: resetGoal,
  } = useForm({
    defaultValues: { title: '', frequency: 'daily' },
  })

  const onAddGoalSubmit = async (data) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, targetDate: formatDateLocal(currentDate), userId: user?.uid }),
      })
      if (res.ok) {
        resetGoal()
        setShowAddGoal(false)
        refresh()
      }
    } catch (err) {
      console.error('Failed to add goal:', err)
    }
  }


  // Re-runs the keyword analysis for the selected date — the same endpoint
  // DiaryLLM fires after a save — then broadcasts the shared refresh signal.
  const handleAnalyze = async () => {
    if (analyzing) return
    setAnalyzing(true)
    try {
      const res = await fetch('/api/goals/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formatDateLocal(currentDate), userId: user?.uid }),
      })
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('journalSaved'))
      }
    } catch (err) {
      console.error('Goal analysis failed:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  // Read the permanent color for a date directly from the stored dayStatuses map.
  // Falls back to 'none' if no journal was written or no status has been stored yet.
  const getDayStatus = useCallback((dateStr) => {
    const hasJournal = journals.some(j => {
      const jd = new Date(j.date)
      return formatDateLocal(jd) === dateStr
    })
    if (!hasJournal) return 'none'
    return dayStatuses[dateStr] || 'none'
  }, [journals, dayStatuses])

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const days = daysInMonth(year, month)
    const firstDay = firstDayOfMonth(year, month)

    const daysArr = []
    for (let i = 0; i < firstDay; i++) {
      daysArr.push(<div key={`empty-${i}`} className="h-8 w-8"></div>)
    }

    for (let day = 1; day <= days; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isSelected = formatDateLocal(currentDate) === dateStr
      const status = getDayStatus(dateStr)

      let dotColor = ''
      if (status === 'red') dotColor = 'bg-brick'
      if (status === 'yellow') dotColor = 'bg-ochre'
      if (status === 'green') dotColor = 'bg-sage'

      daysArr.push(
        <div
          key={day}
          onClick={() => setCurrentDate(new Date(year, month, day))}
          className={`h-8 w-8 flex flex-col items-center justify-center rounded-md cursor-pointer transition-all relative
            ${isSelected ? 'bg-terracotta text-parchment font-bold' : 'hover:bg-vellum text-ink'}
          `}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCurrentDate(new Date(year, month, day)); }}}
          aria-label={`Select date: ${new Date(year, month, day).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
          aria-pressed={isSelected}
        >
          <span className="text-xs z-10">{day}</span>
          {dotColor && (
            <div className={`absolute inset-0 rounded-md opacity-15 ${dotColor}`} aria-hidden="true"></div>
          )}
          {dotColor && (
            <div className={`w-1 h-1 rounded-full mt-0.5 z-10 ${dotColor}`} aria-hidden="true"></div>
          )}
        </div>
      )
    }
    return daysArr
  }, [currentDate, journals, dayStatuses, getDayStatus])

  const selectedDateStr = formatDateLocal(currentDate)
  const weekStart = new Date(currentDate)
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const monthStart = new Date(currentDate)
  monthStart.setHours(0, 0, 0, 0)
  monthStart.setDate(1)

  const activeGoals = useMemo(() => {
    const selectedDateStr = formatDateLocal(currentDate)
    const weekStart = new Date(currentDate)
    weekStart.setHours(0, 0, 0, 0)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const monthStart = new Date(currentDate)
    monthStart.setHours(0, 0, 0, 0)
    monthStart.setDate(1)

    return goals.filter(g => {
      const gd = new Date(g.startDate)
      const goalDateStr = formatDateLocal(gd)

      if (g.frequency === 'daily') return goalDateStr === selectedDateStr
      if (g.frequency === 'weekly') {
        const gws = new Date(gd)
        gws.setHours(0, 0, 0, 0)
        gws.setDate(gws.getDate() - gws.getDay())
        return formatDateLocal(gws) === formatDateLocal(weekStart)
      }
      if (g.frequency === 'monthly') {
        const gMonthStart = new Date(gd)
        gMonthStart.setHours(0, 0, 0, 0)
        gMonthStart.setDate(1)
        return formatDateLocal(gMonthStart) === formatDateLocal(monthStart)
      }
      return false
    })
  }, [currentDate, goals])

  return (
    <div className="card-vintage p-4 space-y-4 h-[50%]">
      <div className="flex items-center justify-between">
        <h3 className="eyebrow">Goal Calendar</h3>
        <button
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="p-1 hover:bg-vellum rounded-md text-ink-soft transition-colors cursor-pointer"
          aria-label={showAddGoal ? 'Hide add goal form' : 'Show add goal form'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {showAddGoal && (
        <form onSubmit={handleGoalSubmit(onAddGoalSubmit)} className="space-y-2">
          <div>
            <label htmlFor="goal-title" className="sr-only">
              Goal title
            </label>
            <input
              id="goal-title"
              type="text"
              placeholder="What's your goal?"
              required
              {...registerGoal('title', { required: true })}
              className="w-full input-vintage text-sm placeholder:text-ink-faint font-body"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="goal-frequency" className="sr-only">
                Goal frequency
              </label>
              <select
                id="goal-frequency"
                {...registerGoal('frequency')}
                className="w-full input-vintage text-xs font-body cursor-pointer"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <button type="submit" className="btn-vintage px-4 py-2 text-xs cursor-pointer">Add</button>
          </div>
        </form>
      )}

      {/* Calendar Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-ink font-display">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="p-1 hover:bg-vellum rounded text-ink-soft cursor-pointer"
              aria-label="Previous month"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2" /></svg>
            </button>
            <button
              onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="p-1 hover:bg-vellum rounded text-ink-soft cursor-pointer"
              aria-label="Next month"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" /></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-[10px] text-ink-soft font-bold uppercase tracking-wider text-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays}
        </div>
      </div>

      {/* Selected Day Goals */}
      <div className="pt-2 border-t border-sepia/15 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-ink font-body">Goals for {currentDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sepia hover:text-sepia-deep disabled:opacity-50 transition-colors cursor-pointer"
            aria-label={analyzing ? 'Analyzing goals, please wait' : 'Analyze goals for selected date'}
          >
            {analyzing ? (
              <div className="w-3 h-3 border border-sepia/30 border-t-sepia rounded-full animate-spin" />
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            Analyze
          </button>
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="h-10 animate-pulse bg-vellum rounded-md"></div>
          ) : activeGoals.length === 0 ? (
            <p className="text-[10px] text-ink-soft text-center py-2 italic">No goals set for this period.</p>
          ) : (
            activeGoals.map(goal => {
              const isCompleted = goal.completedDates.some(d =>
                typeof d === 'string' ? d.startsWith(formatDateLocal(currentDate)) : false
              )
              return (
                <div key={goal._id} className="group/item flex items-center justify-between p-2 rounded-md bg-paper/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-sage' : 'bg-sepia/30'}`}></div>
                    <span className={`text-xs font-body ${isCompleted ? 'text-ink line-through' : 'text-ink-soft'}`}>{goal.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-tighter text-ink-faint font-bold">{goal.frequency}</span>
                    <button
                      onClick={async () => {
                        if (confirm('Delete this goal?')) {
                          await fetch(`/api/goals?id=${goal._id}`, { method: 'DELETE' })
                          refresh()
                        }
                      }}
                      className="opacity-100 pointer-fine:opacity-0 pointer-fine:group-hover/item:opacity-100 pointer-fine:focus-visible:opacity-100 p-1 text-ink-soft hover:text-brick transition-all cursor-pointer"
                      aria-label={`Delete goal: ${goal.title}`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" /></svg>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}