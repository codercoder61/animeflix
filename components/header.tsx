import Link from 'next/link'
import { Bookmark, Play } from 'lucide-react'
import SearchBar from './search-bar'

export default function Header() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-4 gap-4
         grid grid-cols-1 justify-items-center
         [@media(min-width:401px)]:flex
         [@media(min-width:401px)]:items-center
         [@media(min-width:401px)]:justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-2xl text-primary hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <Play size={28} className="fill-current" />
          <span>AnimeFlix</span>
        </Link>
        
        <div className="flex-1 flex justify-end items-center gap-3 px-4">
          <SearchBar />
          <Link href="/bookmarks" aria-label="My bookmarks" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:border-primary hover:text-primary transition-colors">
            <Bookmark size={17} />
            <span className="hidden sm:inline">Bookmarks</span>
          </Link>
        </div>

        
      </div>
    </header>
  )
}
