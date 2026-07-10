'use client'

import { useState, useCallback, useMemo } from 'react'
import { useData } from '@/lib/DataContext'

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
  const [analyzing, setAnalyzing] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: '', frequency: 'daily' })
  const [currentDate, setCurrentDate] = useState(new Date())


  const handleAddGoal = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newGoal, targetDate: formatDateLocal(currentDate) }),
      })
      if (res.ok) {
        setNewGoal({ title: '', frequency: 'daily' })
        setShowAddGoal(false)
        refresh()
      }
    } catch (err) {
      console.error('Failed to add goal:', err)
    }
  }


  const handleAnalyze = async () => {
    // Functionality removed as per request, but kept the button
    console.log('Manual analysis is disabled. Analysis happens automatically on journal save.')
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
      if (status === 'red') dotColor = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
      if (status === 'yellow') dotColor = 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
      if (status === 'green') dotColor = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]'

      daysArr.push(
        <div
          key={day}
          onClick={() => setCurrentDate(new Date(year, month, day))}
          className={`h-8 w-8 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all relative
            ${isSelected ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 text-slate-400'}
          `}
        >
          <span className="text-xs z-10">{day}</span>
          {dotColor && (
            <div className={`absolute inset-0 rounded-lg opacity-20 ${dotColor.split(' ')[0]}`}></div>
          )}
          {dotColor && (
            <div className={`w-1 h-1 rounded-full mt-0.5 z-10 ${dotColor}`}></div>
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
    <div className="p-4 bg-gray-900/40 rounded-2xl border border-white/5 space-y-4 h-[50%]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Goal Calendar</h3>
        <button
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="p-1 hover:bg-white/5 rounded-md text-slate-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {showAddGoal && (
        <form onSubmit={handleAddGoal} className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <input
            type="text"
            placeholder="What's your goal?"
            value={newGoal.title}
            onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            <select
              value={newGoal.frequency}
              onChange={e => setNewGoal({ ...newGoal, frequency: e.target.value })}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-lg transition-colors">
              Add
            </button>
          </div>
        </form>
      )}

      {/* Calendar Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-medium text-slate-400">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="p-1 hover:bg-white/5 rounded text-slate-500"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2" /></svg>
            </button>
            <button
              onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="p-1 hover:bg-white/5 rounded text-slate-500"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" /></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-[10px] text-slate-600 font-bold uppercase tracking-wider text-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays}
        </div>
      </div>

      {/* Selected Day Goals */}
      <div className="pt-2 border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Goals for {currentDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
          >
            {analyzing ? (
              <div className="w-3 h-3 border border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
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
            <div className="h-10 animate-pulse bg-white/5 rounded-lg"></div>
          ) : activeGoals.length === 0 ? (
            <p className="text-[10px] text-slate-600 text-center py-2">No goals set for this period.</p>
          ) : (
            activeGoals.map(goal => {
              const isCompleted = goal.completedDates.some(d =>
                typeof d === 'string' ? d.startsWith(formatDateLocal(currentDate)) : false
              )
              return (
                <div key={goal._id} className="group/item flex items-center justify-between p-2 rounded-lg bg-black/20 border border-white/[0.03] hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'bg-slate-700'}`}></div>
                    <span className={`text-xs ${isCompleted ? 'text-white' : 'text-slate-400'}`}>{goal.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-tighter text-slate-600 font-bold">{goal.frequency}</span>
                    <button
                      onClick={async () => {
                        if (confirm('Delete this goal?')) {
                          await fetch(`/api/goals?id=${goal._id}`, { method: 'DELETE' })
                          refresh()
                        }
                      }}
                      className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-600 hover:text-rose-400 transition-all"
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
