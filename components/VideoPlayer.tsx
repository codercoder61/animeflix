'use client'

import { useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

interface VideoPlayerProps {
  url: string
  poster?: string
}

export default function VideoPlayer({ url, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player | null>(null)
  const [loading, setLoading] = useState(true)
  const prevUrlRef = useRef<string | null>(null)

 

  // useEffect(() => {
  //   const player = playerRef.current
  //   if (!player || !url) return

  //   if (prevUrlRef.current !== url) {
  //     const type = url.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
  //     player.src({ src: url, type })
  //     setLoading(true)
  //     prevUrlRef.current = url
  //   }
  // }, [url])

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>


      <div className="relative w-full aspect-video max-w-[1200px] mx-auto overflow-hidden bg-black">
        <iframe 
    className="absolute inset-0 w-full h-full border-0"
          poster={poster}
          playsInline
          src={url}
          width="100%" 
          height="100%" 
          title="Video player"
    allow="autoplay; fullscreen; picture-in-picture"
    allowFullScreen
    scrolling="no">
        </iframe>
      </div>
    </div>
  )
}
