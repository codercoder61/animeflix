'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { ChevronLeft, Loader, Play } from 'lucide-react'
import { useParams } from 'next/navigation'
import VideoPlayer from '../../../../components/VideoPlayer'

interface Episode {
  id: number
  name_episode: string
  image_episode: string
  anime_title_id: number
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

  for (let i = start; i <= end; i++) pages.push(i)

  if (end < totalPages - 1) pages.push('...')
  if (end < totalPages) pages.push(totalPages)

  return pages.filter((item, index, self) => self.indexOf(item) === index)
}

export default function WatchPage() {
  const params = useParams<{ id1: string; id2: string }>()
  const animeId = params.id1
  const animeId2 = params.id2

  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSourceLoading, setIsSourceLoading] = useState(false)
  const [sourceError, setSourceError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [desc, setDesc] = useState('')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState("")

  const episodesPerPage = 12
  const totalPages = Math.ceil(episodes.length / episodesPerPage)

  // Load the episode list for this anime.
  useEffect(() => {
    if (!animeId2) return

    const controller = new AbortController()

    const fetchEpisodes = async () => {
      setIsLoading(true)
      setEpisodes([])
      setSelectedEpisode(null)
      setUrl('')

      try {
        const response = await fetch(
          `https://causing-recording-remark-lid.trycloudflare.com/animeGangsters/getEpisodes.php?id=${encodeURIComponent(animeId2)}`,
          { signal: controller.signal }
        )

        if (!response.ok) throw new Error(`Failed to fetch episodes (${response.status})`)

        const data: Episode[] = await response.json()
        setEpisodes(Array.isArray(data) ? data : [])
        setCurrentPage(1)
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching episodes:', error)
          setEpisodes([])
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    fetchEpisodes()
    return () => controller.abort()
  }, [animeId2])

  // // Resolve a selected episode to its playable source.
  // const fetchEpisodeSource = useCallback(async (episodeId: number) => {
  //   setIsSourceLoading(true)
  //   setSourceError('')
  //   setUrl('')

  //   try {
  //     const episodeHref = `https://anime3rb.com/episode/${animeId}/${episodeId}`
  //     const response = await fetch(
  //       `https://web-production-4b80.up.railway.app/getEpisodeSource?episodeHref=${encodeURIComponent(episodeHref)}`,
  //       {
  //         headers: { 'ngrok-skip-browser-warning': 'true' }
  //       }
  //     )

  //     if (!response.ok) throw new Error(`Failed to fetch episode source (${response.status})`)

  //     const data = await response.json()

  //     if (!data.episodeSrc) {
  //       throw new Error('No video source was returned for this episode.')
  //     }

  //     setUrl(`/api/video?url=${encodeURIComponent(data.episodeSrc)}`)
  //   } catch (error) {
  //     console.error('Error fetching episode source:', error)
  //     setSourceError('Unable to load this episode. Please try another episode.')
  //     setUrl('')
  //   } finally {
  //     setIsSourceLoading(false)
  //   }
  // }, [animeId])

  // Automatically load the first episode after the list is received.
  useEffect(() => {
    if (episodes.length === 0) return

    const firstEpisode = episodes[0]
    setSelectedEpisode(firstEpisode.id)
  }, [episodes])

  // Load anime title and synopsis.
  // useEffect(() => {
  //   if (!animeId) return

  //   const controller = new AbortController()

  //   const fetchAnimeInfo = async () => {
  //     try {
  //       const response = await fetch(
  //         `https://YOUR_API_URL/getAnimeInfo.php?animeId=${encodeURIComponent(animeId)}`,
  //         { signal: controller.signal }
  //       )

  //       if (!response.ok) throw new Error('Failed to fetch anime info')

  //       const data = await response.json()
  //       setDesc(data.synopsis || '')
  //       setTitle(data.anime_name || '')
  //     } catch (error) {
  //       if (error instanceof Error && error.name !== 'AbortError') {
  //         console.error('Error fetching anime info:', error)
  //       }
  //     }
  //   }

  //   fetchAnimeInfo()
  //   return () => controller.abort()
  // }, [animeId])

  const handleEpisodeChange = (episodeNumber: number) => {
  setSelectedEpisode(episodeNumber);
  setSourceError('');
  setUrl(
    `https://megaplay.buzz/stream/mal/${animeId}/${episodeNumber}/sub`
  );
};
useEffect(() => {
  if (episodes.length === 0 || !animeId) return;

  setSelectedEpisode(1);
  setUrl(`https://megaplay.buzz/stream/mal/${animeId}/1/sub`);
}, [episodes, animeId]);
  const startIndex = (currentPage - 1) * episodesPerPage
  const currentEpisodes = episodes.slice(startIndex, startIndex + episodesPerPage)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-0 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity mb-5 font-semibold text-sm"
        >
          <ChevronLeft size={18} />
          Back to Home
        </Link>

        {/* Player: the player component should render an iframe/video at 100% width and height. */}
        <section className="w-full mb-6">
          <div className="relative w-full aspect-video min-h-[220px] sm:min-h-0 bg-black rounded-xl overflow-hidden shadow-lg">
            {url ? (
              <div className="absolute inset-0 w-full h-full [&_iframe]:!absolute [&_iframe]:!inset-0 [&_iframe]:!w-full [&_iframe]:!h-full [&_iframe]:!border-0 [&_video]:!w-full [&_video]:!h-full">
                <VideoPlayer key={url} url={url} />
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                {isSourceLoading ? (
                  <Loader size={34} className="animate-spin" />
                ) : (
                  <>
                    <Play size={38} className="opacity-70" />
                    <p className="text-sm text-white/70">
                      {sourceError || (selectedEpisode ? 'Video unavailable' : 'Select an episode to start watching')}
                    </p>
                  </>
                )}
              </div>
            )}

            {isSourceLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/75 text-white">
                <Loader size={34} className="animate-spin" />
                <p className="text-sm font-medium">Loading episode...</p>
              </div>
            )}
          </div>
        </section>

        {/* Anime details and current episode */}
        <section className="mb-7">
          {title && <h1 className="text-2xl sm:text-3xl font-bold mb-3">{title}</h1>}

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2">
              <Play size={16} className="text-primary" />
              <span className="text-sm text-muted-foreground">Now playing</span>
              <span className="font-bold text-primary">
                {selectedEpisode ? `Episode ${selectedEpisode}` : '—'}
              </span>
            </div>
          </div>

          {desc && (
            <p dir="rtl" className="text-justify text-sm sm:text-base leading-7 text-muted-foreground">
              {desc}
            </p>
          )}
        </section>

        {/* Episode selector */}
        <section className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="text-xl font-bold">Episodes</h2>
              <p className="text-sm text-muted-foreground">{episodes.length} episodes available</p>
            </div>
            {selectedEpisode !== null && (
              <span className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1 font-semibold">
                Selected: {selectedEpisode}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader size={26} className="animate-spin text-primary" />
            </div>
          ) : episodes.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No episodes available.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                {currentEpisodes.map((episode, index) => {
  const episodeNumber = startIndex + index + 1;
  const isSelected = selectedEpisode === episodeNumber;

  return (
    <button
      key={episode.id}
      type="button"
      onClick={() => handleEpisodeChange(episodeNumber)}
      aria-pressed={isSelected}
      className={`group relative min-w-0 overflow-hidden rounded-lg border text-left transition-all ${
        isSelected
          ? 'border-primary ring-2 ring-primary shadow-md'
          : 'border-border hover:border-primary/70'
      }`}
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        <img
          src={episode.image_episode || '/placeholder.svg'}
          alt={`Episode ${episodeNumber}`}
          onError={(event) => {
            event.currentTarget.src = '/placeholder.svg';
          }}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-primary p-2 text-primary-foreground">
              <Play size={18} fill="currentColor" />
            </span>
          </div>
        )}
      </div>

      <div className={`p-2 ${
        isSelected
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-foreground'
      }`}>
        <p className="font-bold text-xs">Episode {episodeNumber}</p>
        <p className="text-xs opacity-80 truncate mt-1">
          {episode.name_episode || `Episode ${episodeNumber}`}
        </p>
      </div>
    </button>
  );
})}
              </div>

              {totalPages > 1 && (
                <nav aria-label="Episode pages" className="flex justify-center items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {getPaginationRange(totalPages, currentPage).map((page, index) =>
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">…</span>
                    ) : (
                      <button
                        key={`page-${page}`}
                        type="button"
                        onClick={() => setCurrentPage(page as number)}
                        aria-current={currentPage === page ? 'page' : undefined}
                        className={`min-w-9 px-3 py-2 text-sm rounded-lg transition-colors ${
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
                    type="button"
                    onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
