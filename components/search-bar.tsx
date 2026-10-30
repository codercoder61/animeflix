
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'

interface Anime {
  id: number
  anime_name: string
  rating: string
  num_episodes: string
  animeUrl: string
  genres: string
  anime_image: string
  airYear: string
  trailer: string
  studio: string
  synopsis: string
  status: string
  malId: number
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Anime[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const latestRequestId = useRef(0)

  const searchAnime = async (query: string, requestId: number) => {
    try {
      const response = await fetch(
        `https://causing-recording-remark-lid.trycloudflare.com/animeGangsters/search.php?query=${encodeURIComponent(query)}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true"
          }
        }
      )

      if (!response.ok) {
        throw new Error("Network error")
      }

      const data: Anime[] = await response.json()

      if (requestId === latestRequestId.current) {
        setSuggestions(data)
        setIsOpen(data.length > 0)
      }

    } catch (error) {
      console.error("Error searching anime:", error)

      if (requestId === latestRequestId.current) {
        setSuggestions([])
        setIsOpen(false)
      }
    }
  }

  useEffect(() => {
    if (query.trim() === '') {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    const timeout = setTimeout(() => {
      latestRequestId.current += 1
      searchAnime(query.trim(), latestRequestId.current)
    }, 300)

    return () => clearTimeout(timeout)

  }, [query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
  }

  const handleSelectAnime = () => {
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-xs">

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />

        <input
          type="text"
          placeholder="Search anime..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && suggestions.length > 0 && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 bg-muted text-foreground placeholder-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">

          {suggestions.map((anime) => (
            <Link
              key={anime.id}
              href={`/watch/${anime.id}`}
              onClick={handleSelectAnime}
              className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b border-border last:border-b-0"
            >
              <img
                crossOrigin="anonymous"
                src={anime.anime_image || "/placeholder.svg"}
                alt={anime.anime_name}
                className="w-12 h-12 rounded object-cover"
              />

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {anime.anime_name}
                </p>

                <p className="text-xs text-muted-foreground">
                  {anime.airYear} • {anime.num_episodes} Episodes
                </p>
              </div>
            </Link>
          ))}

        </div>
      )}

      {query && !isOpen && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg p-4 text-center text-muted-foreground z-50">
          No anime found matching "{query}"
        </div>
      )}

    </div>
  )
}
