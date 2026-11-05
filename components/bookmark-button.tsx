'use client'

import { useEffect, useState } from 'react'
import { Bookmark } from 'lucide-react'
import { isBookmarked, toggleBookmark, type Bookmark as BookmarkItem } from '@/lib/bookmarks'

export default function BookmarkButton({ item, label = 'Bookmark' }: { item: BookmarkItem; label?: string }) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const sync = () => setSaved(isBookmarked(item.id))
    sync()
    window.addEventListener('animeflix-bookmarks-changed', sync)
    return () => window.removeEventListener('animeflix-bookmarks-changed', sync)
  }, [item.id])

  return (
    <button
      type="button"
      onClick={() => setSaved(toggleBookmark(item))}
      aria-pressed={saved}
      aria-label={`${saved ? 'Remove' : 'Add'} ${label.toLowerCase()}`}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${saved ? 'bg-primary text-primary-foreground' : 'bg-black/60 text-white hover:bg-primary'}`}
    >
      <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
      {saved ? 'Bookmarked' : label}
    </button>
  )
}
