'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { ChevronLeft, Loader } from 'lucide-react'
import VideoPlayer from '@/components/VideoPlayer'

interface Episode {
  id: number
  episodeNumber: number
  episodeName: string
}

interface PaginationData {
  currentPage: number
  limit: number
  totalEpisodes: number
  totalPages: number
  hasMore: boolean
  startIndex: number
  endIndex: number
}

export default function WatchPage() {
  const params = useParams()
  const animeId = params.id as string

  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  /* ---------------- Fetch Episodes ---------------- */
  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(
          `https://offices-startup-airfare-steam.trycloudflare.com/getAnimeEpisodesInfo?episodeHref=https://anime3rb.com/episode/${animeId}/1&page=${currentPage}&limit=12`
        )
        const data = await res.json()

        if (res.ok) {
          setEpisodes(prev =>
            currentPage === 1 ? data.episodes : [...prev, ...data.episodes]
          )
          setPagination(data.pagination)
        }
      } catch (err) {
        console.error('Error fetching episodes:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEpisodes()
  }, [animeId, currentPage])

  /* ---------------- Fetch Episode Source ---------------- */
  const fetchEpisodeSource = async (episodeNumber: number) => {
    try {
      setIsLoading(true)
      const res = await fetch(
        `https://offices-startup-airfare-steam.trycloudflare.com/getEpisodeSource?episodeHref=https://anime3rb.com/episode/${animeId}/${episodeNumber}`
      )
      const data = await res.json()

      if (res.ok) {
        const encodedUrl = encodeURIComponent(data.episodeSrc)
        setUrl(`/api/video?url=${encodedUrl}`)
        setSelectedEpisode(episodeNumber)
      }
    } catch (err) {
      console.error('Error fetching episode source:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------------- Initial Episode ---------------- */
  useEffect(() => {
    fetchEpisodeSource(1)
  }, [animeId])

  /* ---------------- Fetch Anime Info ---------------- */
  useEffect(() => {
    const fetchAnimeInfo = async () => {
      try {
        const res = await fetch(
          `https://offices-startup-airfare-steam.trycloudflare.com/getAnimeInfo?animeId=${animeId}`
        )
        const data = await res.json()

        if (res.ok) {
          setTitle(data.animeInfo.title)
          setDesc(data.animeInfo.desc)
        }
      } catch (err) {
        console.error('Error fetching anime info:', err)
      }
    }

    fetchAnimeInfo()
  }, [animeId])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 lg:px-0 py-6">
        {/* Back Button */}
        <Link
          href="/"
          className="flex items-center gap-2 text-primary hover:opacity-80 mb-4 font-semibold text-sm"
        >
          <ChevronLeft size={18} />
          Back to Home
        </Link>

        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden mb-6">
          <VideoPlayer url={url} />
        </div>

        {/* Anime Info */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p dir="rtl" className="text-muted-foreground mb-3 max-w-3xl">
            {desc}
          </p>

          <div className="bg-card p-3 rounded-lg border border-border w-fit">
            <p className="text-xs text-muted-foreground">Now Playing</p>
            <p className="text-xl font-bold text-primary">
              Episode {selectedEpisode}
            </p>
          </div>
        </div>

        {/* Episodes */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Episodes</h2>

          {isLoading && episodes.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader className="animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
                {episodes.map(ep => (
                  <button
                    key={ep.id}
                    onClick={() => fetchEpisodeSource(ep.episodeNumber)}
                    className={`aspect-square rounded-lg font-bold text-xs transition-all ${
                      selectedEpisode === ep.episodeNumber
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {ep.episodeName}
                  </button>
                ))}
              </div>

              {pagination?.hasMore && (
                <div className="text-center">
                  <p className="text-muted-foreground mb-3 text-sm">
                    Showing {pagination.startIndex}-{pagination.endIndex} of{' '}
                    {pagination.totalEpisodes}
                  </p>

                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={isLoading}
                    className="bg-secondary px-4 py-1.5 rounded-lg font-semibold text-sm flex items-center gap-2 mx-auto disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader size={14} className="animate-spin" />
                        Loading…
                      </>
                    ) : (
                      'Load More Episodes'
                    )}
                  </button>
                </div>
              )}

              {pagination && !pagination.hasMore && (
                <p className="text-center text-muted-foreground text-sm py-4">
                  All episodes loaded
                </p>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
