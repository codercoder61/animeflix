'use client'

import { useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

export default function VideoPlayer({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const playerRef = useRef<videojs.Player | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize Video.js once
  useEffect(() => {
    if (!videoRef.current) return

    playerRef.current = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      aspectRatio: '16:9',
    })

    const player = playerRef.current
    player.on('waiting', () => setLoading(true))
    player.on('canplay', () => setLoading(false))
    player.on('playing', () => setLoading(false))

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [])

  // Update source whenever URL changes
  useEffect(() => {
    if (playerRef.current && url) {
      playerRef.current.src({ src: url, type: 'video/mp4' })
      setLoading(true)
    }
  }, [url])

  // Spinner styles
  const overlayStyle = {
    position: 'absolute' as const,
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    zIndex: 10,
  }

  const spinnerStyle = {
    width: 40,
    height: 40,
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }

  return (
    <div style={{ position: 'relative', width: '100%', backgroundColor: '#000', overflow: 'hidden' }}>
      {loading && (
        <div style={overlayStyle}>
          <div style={spinnerStyle} />
          <span style={{ marginTop: 12 }}>Loading video…</span>
        </div>
      )}

      <div data-vjs-player>
        <video ref={videoRef} className="video-js vjs-big-play-centered" />
      </div>
    </div>
  )
}
