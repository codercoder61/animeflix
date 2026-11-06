'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { isEpisodeWatched, toggleEpisodeWatched, WATCHED_CHANGED_EVENT } from '@/lib/watched'

export default function WatchedButton({ episodeId }: { episodeId: string }) {
  const [watched, setWatched] = useState(false)

  useEffect(() => {
    const sync = () => setWatched(isEpisodeWatched(episodeId))
    sync()
    window.addEventListener(WATCHED_CHANGED_EVENT, sync)
    return () => window.removeEventListener(WATCHED_CHANGED_EVENT, sync)
  }, [episodeId])

  return (
    <button
      type="button"
      onClick={() => setWatched(toggleEpisodeWatched(episodeId))}
      aria-pressed={watched}
      aria-label={`${watched ? 'Mark episode as unwatched' : 'Mark episode as watched'}`}
      title={watched ? 'Mark as unwatched' : 'Mark as watched'}
      className={`absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold shadow-sm transition-colors ${watched ? 'bg-emerald-500 text-white' : 'bg-black/70 text-white hover:bg-primary'}`}
    >
      <Check size={13} strokeWidth={3} />
      {watched ? 'Watched' : 'Mark watched'}
    </button>
  )
}
