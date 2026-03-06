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

  useEffect(() => {
    if (!videoRef.current || playerRef.current) return

    // --- Dynamic import for Chromecast plugin to avoid SSR issues
    import('videojs-chromecast').then(() => {
      const player = videojs(videoRef.current!, {
        controls: true,
        fluid: false,
        responsive: true,
        aspectRatio: '16:9',
        controlBar: {
          children: [
            'playToggle',
            'volumePanel',
            'progressControl',
            'fullscreenToggle',
            'chromecastButton', // Chromecast
            'replayButton',     // Replay custom
            'downloadButton'    // Download custom
          ]
        }
      })

      // --- Replay Button
      const Button = videojs.getComponent('Button')
      class ReplayButton extends Button {
        constructor(player: any, options: any) {
          super(player, options)
          this.controlText('Replay')
        }
        handleClick() {
          player.currentTime(0)
          player.play()
        }
      }
      videojs.registerComponent('replayButton', ReplayButton)

      // --- Download Button
      class DownloadButton extends Button {
        constructor(player: any, options: any) {
          super(player, options)
          this.controlText('Download')
        }
        handleClick() {
          const a = document.createElement('a')
          a.href = player.currentSrc()
          a.download = player.currentSrc().split('/').pop() || 'video.mp4'
          a.click()
        }
      }
      videojs.registerComponent('downloadButton', DownloadButton)

      playerRef.current = player

      // --- Loading overlay
      const hideLoading = () => setLoading(false)
      const showLoading = () => setLoading(true)

      player.on('waiting', showLoading)
      player.on('canplay', hideLoading)
      player.on('playing', hideLoading)
    })

    // --- Cleanup
    return () => {
      const player = playerRef.current
      if (player) {
        player.dispose()
        playerRef.current = null
      }
    }
  }, [])

  // --- Update source if URL changes
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
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            zIndex: 10,
          }}
        >
          <span>Loading video…</span>
        </div>
      )}
      <div data-vjs-player style={{ width: '100%', maxWidth: '1200px' }}>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
          poster={poster}
          playsInline
        />
      </div>
    </div>
  )
}
