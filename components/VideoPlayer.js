'use client'

import { useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

interface VideoPlayerProps {
  url: string
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Step 1: mark component as mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Step 2: initialize Video.js only if mounted and ref exists
  useEffect(() => {
    if (!mounted || !videoRef.current || playerRef.current) return

    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      aspectRatio: '16:9',
      liveui: url?.endsWith('.m3u8') || false,
    })
    

    playerRef.current = player

    const onWaiting = () => setLoading(true)
    const onCanPlay = () => setLoading(false)
    const onPlaying = () => setLoading(false)

    player.on('waiting', onWaiting)
    player.on('canplay', onCanPlay)
    player.on('playing', onPlaying)

    return () => {
      player.off('waiting', onWaiting)
      player.off('canplay', onCanPlay)
      player.off('playing', onPlaying)
      player.dispose()
      playerRef.current = null
    }
  }, [mounted])

  // Step 3: update source and tracks whenever url/tracks change
  const prevUrlRef = useRef(null)

useEffect(() => {
  const player = playerRef.current
  if (!player || !url) return

  // Only change src if URL is actually different
  if (prevUrlRef.current !== url) {
    const type = url.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
    player.src({ src: url, type })
    setLoading(true)
    prevUrlRef.current = url
  }

 
}, [url])


  const overlayStyle = {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    zIndex: 10,
  }

  return (
    <div style={{ position: 'relative', width: '100%', backgroundColor: '#000', overflow: 'hidden' }}>
      {loading && (
        <div style={overlayStyle}>
          <span style={{ marginTop: 12 }}>Loading video…</span>
        </div>
      )}

      {/* ✅ The wrapper with data-vjs-player */}
      <div data-vjs-player>
<video
  ref={videoRef}
  className="video-js vjs-big-play-centered"
  playsInline
/>
      </div>
    </div>
  )
}
