'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { ChevronLeft, Loader, Play } from 'lucide-react'
import { useParams, useSearchParams } from 'next/navigation'
import BookmarkButton from '@/components/bookmark-button'
import WatchedButton from '@/components/watched-button'
import { animeData } from '@/lib/anime-data'

interface Episode {
  id: number
  name_episode: string
  image_episode: string
  anime_title_id: number
}

interface AnimeTitle {
  id?: number | string
  anime_name?: string
  rating?: string | number | null
  num_episodes?: string | number | null
  animeUrl?: string
  genres?: string
  anime_image?: string
  airYear?: string | number | null
  trailer?: string
  studio?: string
  synopsis?: string
  status?: string
  malId?: number | string | null
}

interface EpisodesResponse {
  episodes: Episode[]
  anime_title?: AnimeTitle
}

interface RelatedAnime {
  id?: number | string
  malId?: number | string
  anime_id?: number | string
  title?: string
  anime_name?: string
  name?: string
  image?: string
  anime_image?: string
  poster?: string
  relation?: string
  relation_type?: string
}

interface AnimeCharacter {
  id?: number | string
  name?: string
  character_name?: string
  role?: string
  image_url?: string
  image?: string
  character_image?: string
}

const getList = <T,>(data: unknown, keys: string[]): T[] => {
  if (Array.isArray(data)) return data as T[]
  if (!data || typeof data !== 'object') return []

  for (const key of keys) {
    const value = (data as Record<string, unknown>)[key]
    if (Array.isArray(value)) return value as T[]
  }

  return []
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
  const searchParams = useSearchParams()
  const animeId = params.id1
  const animeId2 = params.id2
  const animeInfo = animeData.find((anime) => anime.id === `${animeId}/${animeId2}`)
  const animeName = animeInfo?.title ?? 'Saved anime'

  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSourceLoading, setIsSourceLoading] = useState(false)
  const [sourceError, setSourceError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [animeTitle, setAnimeTitle] = useState<AnimeTitle | null>(null)
  const [url, setUrl] = useState("")
  const [malId, setMalId] = useState<string | null>(null)
  const [relatedAnime, setRelatedAnime] = useState<RelatedAnime[]>([])
  const [characters, setCharacters] = useState<AnimeCharacter[]>([])
  const [activeTab, setActiveTab] = useState<'related' | 'characters'>('related')
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)

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
      setAnimeTitle(null)
      setMalId(null)
      setUrl('')

      try {
        const response = await fetch(
          `/api/episodes?animeId=${encodeURIComponent(animeId2)}`,
          { signal: controller.signal }
        )

        if (!response.ok) throw new Error(`Failed to fetch episodes (${response.status})`)

        const data: EpisodesResponse | Episode[] = await response.json()
        const episodeList = Array.isArray(data) ? data : data.episodes
        const responseAnimeTitle = Array.isArray(data) ? null : data.anime_title
        const responseMalId = responseAnimeTitle?.malId

        setEpisodes(Array.isArray(episodeList) ? episodeList : [])
        setAnimeTitle(responseAnimeTitle ?? null)
        setMalId(responseMalId != null ? String(responseMalId) : null)
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

  useEffect(() => {
    if (!animeId2) return

    const controller = new AbortController()
    const fetchDetails = async () => {
      setIsDetailsLoading(true)
      try {
        const encodedId = encodeURIComponent(animeId2)
        const [relatedResponse, charactersResponse] = await Promise.all([
          fetch(`https://pneuexpress.online/anime_gang/getRelatedAnime.php?id=${encodedId}`, { signal: controller.signal }),
          fetch(`https://pneuexpress.online/anime_gang/getAnimeCharacters.php?id=${encodedId}`, { signal: controller.signal }),
        ])

        if (!relatedResponse.ok || !charactersResponse.ok) {
          throw new Error('Failed to fetch anime details')
        }

        const [relatedData, charactersData] = await Promise.all([
          relatedResponse.json(),
          charactersResponse.json(),
        ])

        setRelatedAnime(getList<RelatedAnime>(relatedData, ['relatedAnime', 'related_anime', 'relations', 'data']))
        setCharacters(getList<AnimeCharacter>(charactersData, ['characters', 'data']))
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching anime details:', error)
          setRelatedAnime([])
          setCharacters([])
        }
      } finally {
        if (!controller.signal.aborted) setIsDetailsLoading(false)
      }
    }

    fetchDetails()
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
    const streamId = malId ?? animeId
    const newUrl = `https://megaplay.buzz/stream/mal/${streamId}/${episodeNumber}/sub`

    setSelectedEpisode(episodeNumber)
    setUrl(newUrl)
  }

useEffect(() => {
  if (episodes.length === 0 || (!animeId && !malId)) return

  const requestedEpisode = Number.parseInt(searchParams.get('episode') ?? '', 10)
  const episodeNumber = Number.isInteger(requestedEpisode) && requestedEpisode >= 1 && requestedEpisode <= episodes.length
    ? requestedEpisode
    : 1

  setSelectedEpisode(episodeNumber)
  setCurrentPage(Math.ceil(episodeNumber / episodesPerPage))
  const streamId = malId ?? animeId
  setUrl(`https://megaplay.buzz/stream/mal/${streamId}/${episodeNumber}/sub`)
}, [episodes, animeId, malId, searchParams]);
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
                <iframe
  key={url}
  src={url}
  title="Video player"
  className="absolute inset-0 w-full h-full border-0"
  allow="autoplay; fullscreen; picture-in-picture"
  allowFullScreen
  scrolling="no"
/>
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
          {animeTitle && (
            <div className="flex flex-col gap-5 sm:flex-row">
              {animeTitle.anime_image && (
                <img
                  src={animeTitle.anime_image}
                  alt={`${animeTitle.anime_name ?? 'Anime'} poster`}
                  onError={(event) => {
                    event.currentTarget.src = '/placeholder.svg'
                  }}
                  className="h-40 w-28 rounded-lg object-cover shadow-md"
                />
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold">{animeTitle.anime_name}</h1>
                <div className="mt-3 flex flex-wrap gap-2 text-xs sm:text-sm">
                  {animeTitle.rating && <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Rating {animeTitle.rating}</span>}
                  {animeTitle.airYear && <span className="rounded-full bg-muted px-3 py-1">{animeTitle.airYear}</span>}
                  {animeTitle.status && <span className="rounded-full bg-muted px-3 py-1">{animeTitle.status}</span>}
                  {animeTitle.genres && <span className="rounded-full bg-muted px-3 py-1">{animeTitle.genres}</span>}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 mb-3">
            <div className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2">
              <Play size={16} className="text-primary" />
              <span className="text-sm text-muted-foreground">Now playing</span>
              <span className="font-bold text-primary">
                {selectedEpisode ? `Episode ${selectedEpisode}` : '—'}
              </span>
            </div>
          </div>

          {animeTitle?.synopsis && (
            <p className="text-justify text-sm sm:text-base leading-7 text-muted-foreground">
              {animeTitle.synopsis}
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
              <div className="flex items-center gap-2">
                {selectedEpisode !== null && <BookmarkButton item={{ type: 'episode', id: `${animeId}/${animeId2}-${selectedEpisode}`, animeId: `${animeId}/${animeId2}`, animeName: animeName, episodeNumber: selectedEpisode, image: animeInfo?.image ?? '/placeholder.svg' }} label="Save episode" />}
                {selectedEpisode !== null && <span className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1 font-semibold">Selected: {selectedEpisode}</span>}
              </div>
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
    <div
      key={episode.id}
      className={`group relative min-w-0 overflow-hidden rounded-lg border text-left transition-all ${
        isSelected
          ? 'border-primary ring-2 ring-primary shadow-md'
          : 'border-border hover:border-primary/70'
      }`}
    >
      <button
        type="button"
        onClick={() => handleEpisodeChange(episodeNumber)}
        aria-pressed={isSelected}
        aria-label={`Play episode ${episodeNumber}`}
        className="block w-full text-left"
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
      <WatchedButton episodeId={`${animeId}/${animeId2}-${episodeNumber}`} />
    </div>
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

        <section className="mt-6 bg-card border border-border rounded-xl p-4 sm:p-5">
          <div role="tablist" aria-label="Anime information" className="flex gap-2 border-b border-border mb-5">
            {([
              ['related', 'Related anime'],
              ['characters', 'Characters'],
            ] as const).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {isDetailsLoading ? (
            <div className="flex justify-center py-8" aria-label="Loading anime information">
              <Loader size={24} className="animate-spin text-primary" />
            </div>
          ) : activeTab === 'related' ? (
            relatedAnime.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {relatedAnime.map((anime, index) => {
                  const relatedId = anime.id ?? anime.anime_id ?? anime.malId
                  const animeId = anime.animeUrl.match(/\/anime\/(\d+)/)?.[1];
                  const relatedTitle = anime.title ?? anime.anime_name ?? anime.name ?? 'Related anime'
                  const image = anime.image ?? anime.anime_image ?? anime.poster ?? '/placeholder.svg'
                  const href = relatedId != null ? `/watch/${animeId}/${relatedId}` : '#'

                  return (
                    <Link
                      key={`${relatedId ?? relatedTitle}-${index}`}
                      href={href}
                      className="group overflow-hidden rounded-lg border border-border hover:border-primary/70 transition-colors"
                    >
                      <img
                        src={image}
                        alt={relatedTitle}
                        onError={(event) => {
                          event.currentTarget.src = '/placeholder.svg'
                        }}
                        className="aspect-[2/3] w-full object-cover bg-muted"
                        loading="lazy"
                      />
                      <div className="p-2">
                        <p className="font-semibold text-sm line-clamp-2">{relatedTitle}</p>
                        {(anime.relation ?? anime.relation_type) && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {anime.relation ?? anime.relation_type}
                          </p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No related anime available.</p>
            )
          ) : characters.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {characters.map((character, index) => {
                const characterName = character.name ?? character.character_name ?? 'Unknown character'
                const image = character.image_url ?? character.image ?? character.character_image ?? '/placeholder.svg'

                return (
                  <div key={`${character.id ?? characterName}-${index}`} className="flex items-center gap-3 rounded-lg border border-border p-2">
                    <img
                      src={image}
                      alt={characterName}
                      onError={(event) => {
                        event.currentTarget.src = '/placeholder.svg'
                      }}
                      className="size-12 rounded-md object-cover bg-muted shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm line-clamp-2">{characterName}</p>
                      {character.role && <p className="text-xs text-muted-foreground mt-1">{character.role}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No character information available.</p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
