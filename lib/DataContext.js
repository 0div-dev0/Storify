'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
  getCachedJournalList,
  setCachedJournalList,
  getCachedGoals,
  setCachedGoals,
  getCachedDayStatuses,
  setCachedDayStatuses,
  invalidateJournalCache,
  invalidateAllUserCache,
} from '@/lib/journalCache'

const DataContext = createContext()

export function DataProvider({ children }) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const [goals, setGoals] = useState([])
  const [journals, setJournals] = useState([])
  const [dayStatuses, setDayStatuses] = useState({})
  const [loading, setLoading] = useState(true)
  const [optimisticJournal, setOptimisticJournal] = useState(null)

  // On first mount per user, hydrate from cache instantly (SWR: serve stale, revalidate in bg)
  useEffect(() => {
    if (!userId) return

    const cachedJournals = getCachedJournalList(userId)
    const cachedGoals = getCachedGoals(userId)
    const cachedStatuses = getCachedDayStatuses(userId)

    if (cachedJournals) setJournals(cachedJournals)
    if (cachedGoals) setGoals(cachedGoals)
    if (cachedStatuses) setDayStatuses(cachedStatuses)

    // If we had any cached data, show it instantly without the loading spinner
    if (cachedJournals || cachedGoals || cachedStatuses) {
      setLoading(false)
    }
  }, [userId])

  /**
   * Fetch fresh data from all three endpoints.
   * @param {boolean} force - If true, bypasses cache and forces a network fetch.
   */
  const fetchData = useCallback(async (force = false) => {
    if (!userId) return

    // If not forcing, only show the full loading state when we have no cached data
    const hasCached =
      getCachedJournalList(userId) ||
      getCachedGoals(userId) ||
      getCachedDayStatuses(userId)

    if (!hasCached || force) {
      setLoading(true)
    }

    // If forcing, invalidate all caches for this user
    if (force) {
      invalidateAllUserCache(userId)
    }

    try {
      const [goalsRes, journalsRes, statusRes] = await Promise.all([
        fetch('/api/goals'),
        fetch('/api/journals'),
        fetch('/api/day-status'),
      ])

      if (goalsRes.ok) {
        const goalsData = await goalsRes.json()
        const fetchedGoals = goalsData.goals || []
        setGoals(fetchedGoals)
        setCachedGoals(userId, fetchedGoals)
      }

      if (journalsRes.ok) {
        const journalsData = await journalsRes.json()
        const fetchedJournals = journalsData.journals || []
        setJournals(fetchedJournals)
        setCachedJournalList(userId, fetchedJournals)
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json()
        const fetchedStatuses = statusData.statuses || {}
        setDayStatuses(fetchedStatuses)
        setCachedDayStatuses(userId, fetchedStatuses)
      }
    } catch (err) {
      console.error('Failed to fetch data in DataContext:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return

    // Always do a background revalidation on mount, regardless of cache
    fetchData(false)

    // Listen for updates from other components (e.g. after journal save/delete)
    const handleUpdate = () => fetchData(true)
    window.addEventListener('journalSaved', handleUpdate)
    return () => window.removeEventListener('journalSaved', handleUpdate)
  }, [userId, fetchData])

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
