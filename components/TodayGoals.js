'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

import { useData } from '@/lib/DataContext'

export default function TodayGoals() {
  const { goals, loading, refresh } = useData()

  const formatDateLocal = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = formatDateLocal(today)
  
  // Week/Month starts
  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const monthStart = new Date(today)
  monthStart.setDate(1)

  const handleDeleteGoal = async (goalId) => {
    if (confirm('Delete this goal?')) {
      try {
        const res = await fetch(`/api/goals?id=${goalId}`, { method: 'DELETE' })
        if (res.ok) {
          refresh()
        }
      } catch (err) {
        console.error('Failed to delete goal:', err)
      }
    }
  }

  const todayGoals = goals.filter(g => {
    const gd = new Date(g.startDate)
    const gDateStr = formatDateLocal(gd)
    
    if (g.frequency === 'daily') return gDateStr === todayStr
    if (g.frequency === 'weekly') {
      const gws = new Date(gd)
      gws.setHours(0,0,0,0)
      gws.setDate(gws.getDate() - gws.getDay())
      return formatDateLocal(gws) === formatDateLocal(weekStart)
    }
    if (g.frequency === 'monthly') {
      const gms = new Date(gd)
      gms.setHours(0,0,0,0)
      gms.setDate(1)
      return formatDateLocal(gms) === formatDateLocal(monthStart)
    }
    return false
  })

  return (
    <div className="p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <svg className="w-12 h-12 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      </div>
      
      <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
        Today's Focus
      </h3>

      <div className="space-y-2 relative z-10">
        {loading ? (
          [1, 2].map(i => <div key={i} className="h-8 bg-indigo-500/5 animate-pulse rounded-lg"></div>)
        ) : todayGoals.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No goals set for this period. Add one in the calendar!</p>
        ) : (
          todayGoals.map(goal => {
            const isCompleted = goal.completedDates.includes(todayStr);
            return (
              <div key={goal._id} className="group/item flex items-center justify-between p-2 rounded-xl bg-gray-950/40 border border-white/5 transition-all hover:border-indigo-500/30">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${isCompleted ? 'bg-indigo-600 border-indigo-500' : 'border-slate-700'}`}>
                    {isCompleted && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{goal.title}</span>
                </div>
                <button
                  onClick={() => handleDeleteGoal(goal._id)}
                  className="opacity-0 group/item-hover:opacity-100 p-1 rounded-md text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  title="Delete goal"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}