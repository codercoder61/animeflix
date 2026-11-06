'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Bookmark, Play } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { getBookmarks, type Bookmark as BookmarkItem } from '@/lib/bookmarks'
import { animeData } from '@/lib/anime-data'

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])

  useEffect(() => {
    const sync = () => setBookmarks(getBookmarks())
    sync()
    window.addEventListener('animeflix-bookmarks-changed', sync)
    return () => window.removeEventListener('animeflix-bookmarks-changed', sync)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-0 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="text-primary" size={28} />
          <div><h1 className="text-3xl font-bold">My Bookmarks</h1><p className="text-muted-foreground">Your saved anime and episodes, stored in this browser.</p></div>
        </div>
        {bookmarks.length === 0 ? <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">No bookmarks yet. Save an anime or episode to find it here.</div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{bookmarks.map((bookmark) => {
          const episodePath = bookmark.type === 'episode' ? bookmark.animeId.split('/') : []
          const matchedAnime = bookmark.type === 'episode'
            ? animeData.find((anime) => anime.id === bookmark.animeId) ?? animeData.find((anime) => anime.title === (bookmark.animeName ?? bookmark.animeTitle))
            : undefined
          const episodeName = bookmark.type === 'episode'
            ? (bookmark.animeName ?? bookmark.animeTitle ?? matchedAnime?.title ?? 'Saved anime')
            : ''
          const route = matchedAnime?.id ?? (episodePath.length === 2 ? bookmark.animeId : '')
          const [routeId, routeAnimeId] = route.split('/')
          const href = bookmark.type === 'episode' && routeId && routeAnimeId
            ? `/watch/${routeId}/${routeAnimeId}?episode=${encodeURIComponent(bookmark.episodeNumber)}`
            : `/watch/${bookmark.id}`

          return <Link key={bookmark.id} href={href} className="group overflow-hidden rounded-xl border border-border bg-card"><div className="relative aspect-video bg-muted">{bookmark.type === 'anime' && <Image src={bookmark.image} alt={bookmark.title} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition-transform group-hover:scale-105" />}{bookmark.type === 'episode' && <Image src={matchedAnime?.image ?? bookmark.image ?? '/placeholder.svg'} alt={bookmark.animeName ?? bookmark.animeTitle ?? matchedAnime?.title ?? 'Saved anime'} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition-transform group-hover:scale-105" />}<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" /><div className="absolute bottom-3 left-3 text-white"><p className="font-bold">{bookmark.type === 'anime' ? bookmark.title : (bookmark.animeName ?? bookmark.animeTitle ?? 'Saved anime')}</p>{bookmark.type === 'episode' && <p className="text-sm text-white/75">Episode {bookmark.episodeNumber}</p>}</div></div><div className="flex items-center gap-2 p-3 text-sm font-semibold text-primary"><Play size={15} fill="currentColor" /> Watch now</div></Link>
        })}</div>}
      </main>
      <Footer />
    </div>
  )
}
