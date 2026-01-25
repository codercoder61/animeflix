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
  const prevUrlRef = useRef<string | null>(null)

useEffect(() => {
  if (!videoRef.current || playerRef.current) return

  import('@silvermine/videojs-chromecast').then(() => {
    const player = videojs(videoRef.current!, {
      controls: true,
      fluid: true,
      chromecast: {
        appId: 'CC1AD845'
      },
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'progressControl',
          'chromecastButton',
          'fullscreenToggle'
        ]
      }
    })

    playerRef.current = player

    // ✅ Listen to events to hide loading overlay
    const hideLoading = () => setLoading(false)
    const showLoading = () => setLoading(true)

    player.on('waiting', showLoading)
    player.on('canplay', hideLoading)
    player.on('playing', hideLoading)

    // Clean up
    return () => {
      player.off('waiting', showLoading)
      player.off('canplay', hideLoading)
      player.off('playing', hideLoading)
      player.dispose()
      playerRef.current = null
    }
  })
}, [])



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

  return (
    <div style={{ position: 'relative', width: '100%', backgroundColor: '#000', overflow: 'hidden' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          zIndex: 10
        }}>
          <span>Loading video…</span>
        </div>
      )}

      <div data-vjs-player>
        <video ref={videoRef} className="video-js vjs-big-play-centered" playsInline />
      </div>
    </div>
  )
}
