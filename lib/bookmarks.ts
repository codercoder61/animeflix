export type AnimeBookmark = {
  type: 'anime'
  id: string
  title: string
  image: string
}

export type EpisodeBookmark = {
  type: 'episode'
  id: string
  animeId: string
  animeName: string
  animeTitle?: string
  episodeNumber: number
  image?: string
}

export type Bookmark = AnimeBookmark | EpisodeBookmark

const STORAGE_KEY = 'animeflix-bookmarks'

export function getBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return []

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function isBookmarked(id: string): boolean {
  return getBookmarks().some((bookmark) => bookmark.id === id)
}

export function toggleBookmark(bookmark: Bookmark): boolean {
  const bookmarks = getBookmarks()
  const exists = bookmarks.some((item) => item.id === bookmark.id)

  const next = exists
    ? bookmarks.filter((item) => item.id !== bookmark.id)
    : [
        ...bookmarks.filter(
          (item) => item.type !== 'episode' || bookmark.type !== 'episode' || item.animeId !== bookmark.animeId
        ),
        bookmark,
      ]

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('animeflix-bookmarks-changed'))
  return !exists
}
