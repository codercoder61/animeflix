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

  // Fetch episodes on component mount and when page changes
  useEffect(() => {
  const fetchEpisodes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:3001/getAnimeEpisodesInfo?episodeHref=https://anime3rb.com/episode/${animeId}/1&page=${currentPage}&limit=12`
      );
      const data = await response.json();
      console.log(data)
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
          `http://localhost:3001/getEpisodeSource?episodeHref=https://anime3rb.com/episode/${animeId}/${number}`
        )
        const data = await response.json()
        if (response.ok) {
          // Append new episodes if loading more, otherwise replace
          console.log(data)
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
          `http://localhost:3001/getAnimeInfo?animeId=${animeId}`
        )
        const data = await response.json()
                  console.log(data)
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
          <p dir="rtl" className="text-base text-muted-foreground mb-3 max-w-3xl">
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

              {/* Load More Button */}
              {pagination && pagination.hasMore && (
  <div className="text-center">
    <p className="text-muted-foreground mb-3 text-sm">
      Showing {pagination.startIndex}-{pagination.endIndex} of {pagination.totalEpisodes} episodes
    </p>
    <button
      onClick={() => setCurrentPage(prev => prev + 1)}
      disabled={isLoading}
      className="bg-secondary text-secondary-foreground px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity font-semibold text-sm disabled:opacity-50 flex items-center gap-2 mx-auto"
    >
      {isLoading ? (
        <>
          <Loader size={14} className="animate-spin" />
          Loading...
        </>
      ) : (
        'Load More Episodes'
      )}
    </button>
  </div>
)}


              {pagination && !pagination.hasMore && episodes.length > 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">
                  All {pagination.totalEpisodes} episodes loaded
                </p>
              )}
            </>
          )}
        </div>

        {/* Episodes List View */}
        
      </main>

      <Footer />
    </div>
  )
}
