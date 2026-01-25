'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { ChevronLeft, Volume2, Maximize2, Play, Loader } from 'lucide-react'
import { useParams } from 'next/navigation'
import VideoPlayer from '../../../components/VideoPlayer';



interface Episode {
  id: number
  episodeNumber: number
  title: string
  description: string
  duration: string
  releaseDate: string
}

const getPaginationRange = (
  totalPages: number,
  currentPage: number,
  maxVisible = 5
) => {
  const half = Math.floor(maxVisible / 2)
  let start = Math.max(currentPage - half, 1)
  let end = Math.min(start + maxVisible - 1, totalPages)

  // Adjust start if end is at the max
  start = Math.max(end - maxVisible + 1, 1)

  const pages: (number | '...')[] = []

  if (start > 1) pages.push(1)
  if (start > 2) pages.push('...')

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (end < totalPages - 1) pages.push('...')
  if (end < totalPages) pages.push(totalPages)

  // Remove duplicates
  return pages.filter((item, index, self) => self.indexOf(item) === index)
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
  const animeId = params.id
  
  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const [episodes, setEpisodes] = useState([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [desc, setDesc] = useState("")
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const episodesPerPage = 12 // how many episodes per page
const totalPages = Math.ceil(episodes.length / episodesPerPage)

  // Fetch episodes on component mount and when page changes
  useEffect(() => {
  const fetchEpisodes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://writing-mem-committees-butter.trycloudflare.com/getAnimeEpisodesInfo?episodeHref=https://anime3rb.com/episode/${animeId}/1&page=${currentPage}&limit=12`
      );
      const data = await response.json();
      if (response.ok) {
        // Replace episodes on first page, append on load more
        if (currentPage === 1) {
          setEpisodes(data.episodes);
        } else {
          setEpisodes(prev => [...prev, ...data.episodes]);
        }
        setPagination(data.pagination);
      }
    } catch (error) {
      console.log('[v0] Error fetching episodes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchEpisodes();
}, [animeId, currentPage]); // <-- include currentPage

const fetchEpisodeSource = async (number=1) => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `https://writing-mem-committees-butter.trycloudflare.com/getEpisodeSource?episodeHref=https://anime3rb.com/episode/${animeId}/${number}`
        )
        const data = await response.json()
        if (response.ok) {
          // Append new episodes if loading more, otherwise replace
          const encodedUrl = encodeURIComponent(data.episodeSrc);

          setUrl(`/api/video?url=${encodedUrl}`)

        }
      } catch (error) {
        console.log('[v0] Error fetching episode source:', error)
      } finally {
        setIsLoading(false)
      }
    }
  useEffect(()=>{
    

    fetchEpisodeSource()
  },[])

  useEffect(()=>{
    const fetchAnimeInfo = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `https://writing-mem-committees-butter.trycloudflare.com/getAnimeInfo?animeId=${animeId}`
        )
        const data = await response.json()
                  setDesc(data.animeInfo.desc)
                  setTitle(data.animeInfo.title)

        if (response.ok) {
          // Append new episodes if loading more, otherwise replace
          
        }
      } catch (error) {
        console.log('[v0] Error fetching episode source:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnimeInfo()
  },[])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 lg:px-0 py-6">
        {/* Back Button */}
        <Link
          href="/"
          className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity mb-4 font-semibold text-sm"
        >
          <ChevronLeft size={18} />
          Back to Home
        </Link>

        {/* Video Player Section */}
        <div className="bg-black rounded-lg overflow-hidden mb-6 aspect-video">
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex flex-col items-center justify-center">
              <VideoPlayer url={url} />
          </div>
        </div>

        {/* Anime Info */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p dir="rtl" className="text-base text-muted-foreground mb-3">
            {desc}
          </p>
          <div className="flex flex-wrap gap-3">
            
            <div className="bg-card p-3 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground">Now Playing</p>
              <p className="text-xl font-bold text-primary">Episode {selectedEpisode}</p>
            </div>
          </div> 
        </div>

        

        {/* Episode Selector Section */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Episodes</h2>
          
          {isLoading && episodes.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <Loader size={24} className="animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Episode Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
                {episodes.map((episode,index) => (
                  <button
                    key={index}
                    onClick={() => {fetchEpisodeSource(index+1);setSelectedEpisode(index+1)}}
                    className={`aspect-square rounded-lg font-bold text-xs transition-all ${
                      selectedEpisode === index+1
                        ? 'bg-primary text-primary-foreground ring-1 ring-offset-1 ring-offset-background ring-primary'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {episode.episodeName}
                  </button>
                ))}
              </div>
            </>)}
              
{episodes.length > 0 && totalPages > 1 && (
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
      </main>

      <Footer />
    </div>
  )
}
