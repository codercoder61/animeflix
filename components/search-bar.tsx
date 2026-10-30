
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const latestRequestId = useRef(0)

  useEffect(() => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      latestRequestId.current++
      setSuggestions([])
      setIsOpen(false)
      setIsLoading(false)
      setError(false)
      return
    }

    const controller = new AbortController()
    const requestId = ++latestRequestId.current

    const timeout = setTimeout(async () => {
      setIsLoading(true)
      setError(false)

      try {
        const url = `https://causing-recording-remark-lid.trycloudflare.com/animeGangsters/search.php?query=${encodeURIComponent(trimmedQuery)}`

        const response = await fetch(url, {
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`)
        }

        const data = await response.json()

        if (requestId === latestRequestId.current) {
          setSuggestions(Array.isArray(data) ? data : [])
          setIsOpen(Array.isArray(data) && data.length > 0)
        }

      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return

        console.error('Search error:', err)

        if (requestId === latestRequestId.current) {
          setSuggestions([])
          setIsOpen(false)
          setError(true)
        }

      } finally {
        if (requestId === latestRequestId.current) {
          setIsLoading(false)
        }
      }
    }, 300)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
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
    latestRequestId.current++
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
    setError(false)
    setIsLoading(false)
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
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true)
          }}
          className="w-full pl-10 pr-10 py-2 bg-muted text-foreground placeholder-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {query.trim() !== '' && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">

          {isLoading && (
            <p className="p-4 text-center text-muted-foreground">
              Searching...
            </p>
          )}

          {!isLoading && error && (
            <p className="p-4 text-center text-red-500">
              Unable to search anime. Please try again.
            </p>
          )}

          {!isLoading && !error && suggestions.length === 0 && (
            <p className="p-4 text-center text-muted-foreground">
              No anime found matching "{query}"
            </p>
          )}

          
{!isLoading && suggestions && suggestions.map((anime) => {
  const match = anime.animeUrl?.match(/\/anime\/(?:kitsu:)?(\d+)-/)
  const animeId = match?.[1]

  return (
    <Link
      key={anime.id}
      href={`/watch/${animeId}`}
      onClick={clearSearch}
      className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b border-border last:border-b-0"
    >
      <img
        src={anime.anime_image || '/placeholder.svg'}
        alt={anime.anime_name || 'Anime'}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = '/placeholder.svg'
        }}
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
  )
})}


        </div>
      )}

    </div>
  )
}
