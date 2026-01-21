import Link from 'next/link'
import { Play } from 'lucide-react'
import SearchBar from './search-bar'

export default function Header() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-2xl text-primary hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <Play size={28} className="fill-current" />
          <span>AnimeFlix</span>
        </Link>
        
        <div className="flex-1 flex justify-end px-4">
          <SearchBar />
        </div>

        
      </div>
    </header>
  )
}
