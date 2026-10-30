
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { ChevronLeft, Loader } from 'lucide-react'
import { useParams } from 'next/navigation'
import VideoPlayer from '../../../components/VideoPlayer'

interface Episode {
  id: number
  name_episode: string
  image_episode: string
  anime_title_id: number
}

interface AnimeInfo {
  anime_name: string
  synopsis: string
}

const getPaginationRange = (
  totalPages: number,
  currentPage: number,
  maxVisible = 5
) => {
  const half = Math.floor(maxVisible / 2)
  let start = Math.max(currentPage - half, 1)
  let end = Math.min(start + maxVisible - 1, totalPages)

  start = Math.max(end - maxVisible + 1, 1)

  const pages: (number | '...')[] = []

  if (start > 1) pages.push(1)
  if (start > 2) pages.push('...')

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (end < totalPages - 1) pages.push('...')
  if (end < totalPages) pages.push(totalPages)

  return pages.filter(
    (item, index, self) => self.indexOf(item) === index
  )
}

export default function WatchPage() {
  const params = useParams()
  const animeId = params.id as string

  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSourceLoading, setIsSourceLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const [desc, setDesc] = useState('')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  const episodesPerPage = 12

  const totalPages = Math.ceil(episodes.length / episodesPerPage)

  // Fetch episodes
  useEffect(() => {
    if (!animeId) return

    const fetchEpisodes = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(
          `https://YOUR_API_URL/getAnimeEpisodes.php?animeId=${encodeURIComponent(animeId)}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch episodes')
        }

        const data: Episode[] = await response.json()

        setEpisodes(Array.isArray(data) ? data : [])
        setCurrentPage(1)

      } catch (error) {
        console.error('Error fetching episodes:', error)
        setEpisodes([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchEpisodes()
  }, [animeId])

  // Fetch episode source
  const fetchEpisodeSource = async (episodeId: number) => {
    try {
      setIsSourceLoading(true)

      const response = await fetch(
        `https://web-production-4b80.up.railway.app/getEpisodeSource?episodeHref=https://anime3rb.com/episode/${animeId}/${episodeId}`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch episode source')
      }

      const data = await response.json()

      if (data.episodeSrc) {
        const encodedUrl = encodeURIComponent(data.episodeSrc)
        setUrl(`/api/video?url=${encodedUrl}`)
      }

    } catch (error) {
      console.error('Error fetching episode source:', error)
      setUrl('')
    } finally {
      setIsSourceLoading(false)
    }
  }

  // Fetch anime information
  useEffect(() => {
    if (!animeId) return

    const fetchAnimeInfo = async () => {
      try {
        const response = await fetch(
          `https://YOUR_API_URL/getAnimeInfo.php?animeId=${encodeURIComponent(animeId)}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch anime info')
        }

        const data = await response.json()

        setDesc(data.synopsis || '')
        setTitle(data.anime_name || '')

      } catch (error) {
        console.error('Error fetching anime info:', error)
      }
    }

    fetchAnimeInfo()
  }, [animeId])

  // Load first episode when episodes are available
  useEffect(() => {
    if (episodes.length > 0) {
      fetchEpisodeSource(episodes[0].id)
      setSelectedEpisode(episodes[0].id)
    }
  }, [episodes])

  // Change episode
  const handleEpisodeChange = (episode: Episode) => {
    setSelectedEpisode(episode.id)
    fetchEpisodeSource(episode.id)
  }

  const startIndex = (currentPage - 1) * episodesPerPage

  const currentEpisodes = episodes.slice(
    startIndex,
    startIndex + episodesPerPage
  )

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 lg:px-0 py-6">

        <Link
          href="/"
          className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity mb-4 font-semibold text-sm"
        >
          <ChevronLeft size={18} />
          Back to Home
        </Link>

        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden mb-6 aspect-video relative">
          <div className="w-full h-full">
            <VideoPlayer url={url} />
          </div>

          {isSourceLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Loader size={30} className="animate-spin text-white" />
            </div>
          )}
        </div>

        {/* Anime Information */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {title}
          </h1>

          <p
            dir="rtl"
            className="text-justify text-base text-muted-foreground mb-3"
          >
            {desc}
          </p>

          <div className="flex flex-wrap gap-3">
            <div className="bg-card p-3 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground">
                Now Playing
              </p>

              <p className="text-xl font-bold text-primary">
                Episode {selectedEpisode}
              </p>
            </div>
          </div>
        </div>

        {/* Episodes */}
        <div className="bg-card border border-border rounded-lg p-4">

          <h2 className="text-xl font-bold mb-4">
            Episodes ({episodes.length})
          </h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader size={24} className="animate-spin text-primary" />
            </div>
          ) : episodes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No episodes available.
            </p>
          ) : (
            <>
              {/* Episode Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">

                {currentEpisodes.map((episode) => (
                  <button
                    key={episode.id}
                    onClick={() => handleEpisodeChange(episode)}
                    className={`rounded-lg overflow-hidden text-left transition-all border ${
                      selectedEpisode === episode.id
                        ? 'border-primary ring-1 ring-primary'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <div className="aspect-video bg-muted">
                      <img
                        src={episode.image_episode || '/placeholder.svg'}
                        alt={episode.name_episode}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className={`p-2 ${
                      selectedEpisode === episode.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <p className="font-bold text-xs">
                        Episode {episode.id}
                      </p>

                      <p className="text-xs truncate">
                        {episode.name_episode}
                      </p>
                    </div>
                  </button>
                ))}

              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mb-4 flex-wrap">

                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {getPaginationRange(totalPages, currentPage).map((page, idx) =>
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-3 py-1">
                        …
                      </span>
                    ) : (
                      <button
                        key={`page-${page}`}
                        onClick={() => setCurrentPage(page as number)}
                        className={`px-3 py-1 rounded transition-colors ${
                          currentPage === page
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-50"
                  >
                    Next
                  </button>

                </div>
              )}
            </>
          )}
        </div>

      </main>

      <Footer />
    </div>
  )
}
