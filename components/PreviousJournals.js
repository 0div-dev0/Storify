'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useData } from '@/lib/DataContext'
import { useMemo } from 'react'

export default function PreviousJournals({ onEdit, onDelete, activeId }) {
  const { data: session } = useSession()
  const { journals, loading, refresh, optimisticJournal } = useData()
  const [deleting, setDeleting] = useState(null) // id being deleted
  const [collapsed, setCollapsed] = useState(false)

  const displayJournals = useMemo(() => {
    let list = [...journals]
    if (optimisticJournal) {
      list = list.filter(j => j._id !== optimisticJournal._id)
      list.push(optimisticJournal)
      list.sort((a, b) => new Date(b.date) - new Date(a.date))
    }
    return list
  }, [journals, optimisticJournal])


  const handleDelete = async (journal) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return

    setDeleting(journal._id)
    try {
      const res = await fetch(`/api/journals/${journal._id}`, { method: 'DELETE' })
      if (res.ok) {
        // Refresh the list and force cache invalidation
        refresh(true)
        if (onDelete) onDelete()
        // Re‑analyze goals for the date that was just removed
        const deletedDate = new Date(journal.date).toISOString().split('T')[0]
        fetch('/api/goals/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: deletedDate })
        })
          .then(() => {
            // Notify other components (e.g., GoalCalendar) that analysis finished
            window.dispatchEvent(new CustomEvent('journalSaved'))
          })
          .catch(err => console.error('Re‑analysis after delete failed:', err))
      }
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now - d
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  // Group journals by month/year — only recompute when the list changes
  const groupedJournals = useMemo(() => displayJournals.reduce((acc, journal) => {
    const d = new Date(journal.date)
    const key = `${d.toLocaleString('en-US', { month: 'long' })} ${d.getFullYear()}`
    if (!acc[key]) acc[key] = []
    acc[key].push(journal)
    return acc
  }, {}), [displayJournals])

  return (
    <div
      className={`bg-gray-900/60 border-l border-white/5 flex flex-col transition-all duration-300 ${collapsed ? 'w-12' : 'w-full lg:w-80 xl:w-96'
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-sm font-semibold text-white">Journal Entries</h3>
            <span className="text-xs text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-full">
              {displayJournals.length}
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          aria-label={collapsed ? 'Expand journal list' : 'Collapse journal list'}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Journal list */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : displayJournals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-sm text-slate-400 mb-1">No entries yet</p>
              <p className="text-xs text-slate-400">Start writing to see your journals here.</p>
            </div>
          ) : (
            <div className="p-2 space-y-4">
              {Object.entries(groupedJournals).map(([monthYear, entries]) => (
                <div key={monthYear}>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold px-2 mb-1.5">
                    {monthYear}
                  </p>
                  <div className="space-y-1">
                    {entries.map((journal) => (
                      <div
                        key={journal._id}
                        className={`group rounded-xl p-3 cursor-pointer transition-all border ${activeId === journal._id
                            ? 'bg-indigo-500/10 border-indigo-500/30'
                            : 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5'
                          }`}
                        onClick={() => onEdit(journal)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white flex items-center gap-2 truncate">
                              <span className="truncate">{journal.title || 'Untitled Entry'}</span>
                              {journal.isOptimistic && (
                                <span className="flex-shrink-0">
                                  <div className="w-3 h-3 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {formatDate(journal.date)}
                            </p>
                            {journal.plainText && (
                              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                                {journal.plainText.slice(0, 120)}
                              </p>
                            )}
                          </div>
                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(journal)
                            }}
                            disabled={deleting === journal._id}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0"
                            aria-label={deleting === journal._id ? `Deleting ${journal.title || 'Untitled Entry'}` : `Delete journal entry: ${journal.title || 'Untitled Entry'}`}
                          >
                            {deleting === journal._id ? (
                              <div className="w-3.5 h-3.5 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
