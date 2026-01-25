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
  const prevUrlRef = useRef<string | null>(null)

  // Mark component as mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize Video.js player
  useEffect(() => {
    if (!mounted || !videoRef.current || playerRef.current) return

    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      aspectRatio: '16:9',
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'fullscreenToggle'
        ]
      }
    })

    playerRef.current = player

    // Load Chromecast plugin dynamically (client-side only)
    import('videojs-chromecast').then(() => {
      player.chromecast({}) // initialize plugin
      const controlBar = player.getChild('controlBar')
      if (controlBar && !controlBar.getChild('chromecastButton')) {
        controlBar.addChild('chromecastButton', {})
      }
    })

    // Loading overlay handlers
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

  // Update video source when URL changes
  useEffect(() => {
    const player = playerRef.current
    if (!player || !url) return

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
    zIndex: 10
  }

  return (
    <div style={{ position: 'relative', width: '100%', backgroundColor: '#000', overflow: 'hidden' }}>
      {loading && (
        <div style={overlayStyle}>
          <span style={{ marginTop: 12 }}>Loading video…</span>
        </div>
      )}

      <div data-vjs-player>
        <video ref={videoRef} className="video-js vjs-big-play-centered" playsInline />
      </div>
    </div>
  )
}
