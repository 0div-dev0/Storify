/**
 * Journal, goals, and day-status cache using localStorage.
 * Keys: `journals_list_{userId}` for the list, `journal_{id}` for individual entries,
 *       `goals_{userId}` for goals, `day_statuses_{userId}` for day statuses.
 * Each cache entry stores { data, timestamp }.
 * Cache TTL: 5 minutes (lists). Individual journal entries never expire but are invalidated on mutation.
 */

const LIST_TTL = 5 * 60 * 1000; // 5 minutes

function getItem(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setItem(key, data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    // localStorage full — clear old journal cache entries
    clearAllJournalCache();
    try {
      localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch {
      // silent fail
    }
  }
}

function removeItem(key) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

// --- Journal List ---

export function getCachedJournalList(userId) {
  const entry = getItem(`journals_list_${userId}`);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > LIST_TTL) {
    removeItem(`journals_list_${userId}`);
    return null;
  }
  return entry.data;
}

export function setCachedJournalList(userId, journals) {
  setItem(`journals_list_${userId}`, journals);
}

// --- Individual Journal ---

export function getCachedJournal(journalId) {
  const entry = getItem(`journal_${journalId}`);
  if (!entry) return null;
  return entry.data;
}

export function setCachedJournal(journalId, journal) {
  setItem(`journal_${journalId}`, journal);
}

// --- Goals ---

export function getCachedGoals(userId) {
  const entry = getItem(`goals_${userId}`);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > LIST_TTL) {
    removeItem(`goals_${userId}`);
    return null;
  }
  return entry.data;
}

export function setCachedGoals(userId, goals) {
  setItem(`goals_${userId}`, goals);
}

// --- Day Statuses ---

export function getCachedDayStatuses(userId) {
  const entry = getItem(`day_statuses_${userId}`);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > LIST_TTL) {
    removeItem(`day_statuses_${userId}`);
    return null;
  }
  return entry.data;
}

export function setCachedDayStatuses(userId, statuses) {
  setItem(`day_statuses_${userId}`, statuses);
}

// --- Invalidation ---

export function invalidateJournalCache(userId, journalId) {
  removeItem(`journals_list_${userId}`);
  if (journalId) removeItem(`journal_${journalId}`);
}

export function invalidateAllUserCache(userId) {
  removeItem(`journals_list_${userId}`);
  removeItem(`goals_${userId}`);
  removeItem(`day_statuses_${userId}`);
}

export function clearAllJournalCache() {
  if (typeof window === "undefined") return;
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (
      key.startsWith("journals_list_") ||
      key.startsWith("journal_") ||
      key.startsWith("goals_") ||
      key.startsWith("day_statuses_")
    ) {
      localStorage.removeItem(key);
    }
  });
}
