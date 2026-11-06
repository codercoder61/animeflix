const STORAGE_KEY = 'animeflix-watched-episodes'
const WATCHED_CHANGED_EVENT = 'animeflix-watched-changed'

function getStoredWatchedEpisodes(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : []
  } catch {
    return []
  }
}

export function isEpisodeWatched(id: string): boolean {
  return getStoredWatchedEpisodes().includes(id)
}

export function toggleEpisodeWatched(id: string): boolean {
  const watched = getStoredWatchedEpisodes()
  const isWatched = watched.includes(id)
  const next = isWatched ? watched.filter((episodeId) => episodeId !== id) : [...watched, id]

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(WATCHED_CHANGED_EVENT))
  return !isWatched
}

export { WATCHED_CHANGED_EVENT }
