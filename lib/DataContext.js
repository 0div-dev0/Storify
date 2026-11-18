'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getCachedJournalList,
  setCachedJournalList,
  getCachedGoals,
  setCachedGoals,
  getCachedDayStatuses,
  setCachedDayStatuses,
  invalidateAllUserCache,
} from '@/lib/journalCache'
import { useAuth } from '@/lib/AuthContext'

const DataContext = createContext()

export function DataProvider({ children }) {
  const { user } = useAuth()
  const cacheUser = user?.uid || 'local'

  const [goals, setGoals] = useState([])
  const [journals, setJournals] = useState([])
  const [dayStatuses, setDayStatuses] = useState({})
  const [loading, setLoading] = useState(true)
  const [optimisticJournal, setOptimisticJournal] = useState(null)

  // On first mount or when user changes, hydrate from cache instantly
  useEffect(() => {
    const cachedJournals = getCachedJournalList(cacheUser)
    const cachedGoals = getCachedGoals(cacheUser)
    const cachedStatuses = getCachedDayStatuses(cacheUser)

    if (cachedJournals) setJournals(cachedJournals)
    if (cachedGoals) setGoals(cachedGoals)
    if (cachedStatuses) setDayStatuses(cachedStatuses)

    if (cachedJournals || cachedGoals || cachedStatuses) {
      setLoading(false)
    }
  }, [cacheUser])

  /**
   * Fetch fresh data from all three endpoints.
   * @param {boolean} force - If true, bypasses cache and forces a network fetch.
   */
  const fetchData = useCallback(async (force = false) => {
    const hasCached =
      getCachedJournalList(cacheUser) ||
      getCachedGoals(cacheUser) ||
      getCachedDayStatuses(cacheUser)

    if (!hasCached || force) {
      setLoading(true)
    }

    if (force) {
      invalidateAllUserCache(cacheUser)
    }

    const headers = {}
    if (user?.uid) {
      headers['x-user-id'] = user.uid
    }

    try {
      const [goalsRes, journalsRes, statusRes] = await Promise.all([
        fetch('/api/goals', { headers }),
        fetch('/api/journals', { headers }),
        fetch('/api/day-status', { headers }),
      ])

      if (goalsRes.ok) {
        const goalsData = await goalsRes.json()
        const fetchedGoals = goalsData.goals || []
        setGoals(fetchedGoals)
        setCachedGoals(cacheUser, fetchedGoals)
      }

      if (journalsRes.ok) {
        const journalsData = await journalsRes.json()
        const fetchedJournals = journalsData.journals || []
        setJournals(fetchedJournals)
        setCachedJournalList(cacheUser, fetchedJournals)
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json()
        const fetchedStatuses = statusData.statuses || {}
        setDayStatuses(fetchedStatuses)
        setCachedDayStatuses(cacheUser, fetchedStatuses)
      }
    } catch (err) {
      console.error('Failed to fetch data in DataContext:', err)
    } finally {
      setLoading(false)
    }
  }, [cacheUser, user?.uid])

  useEffect(() => {
    fetchData(false)

    const handleUpdate = () => fetchData(true)
    window.addEventListener('journalSaved', handleUpdate)
    return () => window.removeEventListener('journalSaved', handleUpdate)
  }, [fetchData])

  const refresh = (force = false) => fetchData(force)

  return (
    <DataContext.Provider value={{ goals, journals, dayStatuses, loading, refresh, optimisticJournal, setOptimisticJournal }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
