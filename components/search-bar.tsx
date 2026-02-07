'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import Image from "next/image";

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<typeof animeData>([])
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
const searchAnime = async (query: string, requestId: number) => {
  try {
    const response = await fetch(
      `https://essentials-rounds-impacts-traditions.trycloudflare.com/search?q=${query}`
    );
    const data = await response.json();

    if (!response.ok) throw new Error("Network error");

    // Only update if this is the latest request
    if (requestId === latestRequestId.current) {
      setSuggestions(data);
      setIsOpen(data.length > 0);
    }
  } catch (error) {
    console.log("[v0] Error fetching episode source:", error);
    if (requestId === latestRequestId.current) {
      setSuggestions([]);
      setIsOpen(false);
    }
  }
};
const latestRequestId = useRef(0);


useEffect(() => {
  if (query.trim() === "") {
    setSuggestions([]);
    setIsOpen(false);
    return;
  }

  latestRequestId.current += 1;
  const currentRequestId = latestRequestId.current;

  searchAnime(query, currentRequestId);
}, [query]);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
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
              key={anime.animeId}
              href={`/watch/${anime.animeId}`}
              onClick={handleSelectAnime}
              className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b border-border last:border-b-0"
            >
               <img
  src={
    anime.poster
      ? `https://essentials-rounds-impacts-traditions.trycloudflare.com/image-proxy?url=${anime.poster}`
      : "/placeholder.svg"
  }
  alt={anime.title}
  className="w-12 h-12 rounded object-cover"
/>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{anime.title}</p>
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
