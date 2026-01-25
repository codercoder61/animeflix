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
      console.log('Chromecast plugin loaded')
    })
    const player = videojs(videoRef.current, {
  controls: true,
  fluid: true,
  techOrder: ['chromecast', 'html5'],
  chromecast: {
    appId: 'CC1AD845' // Default Media Receiver
  },
  controlBar: {
    children: [
      'playToggle',
      'volumePanel',
      'currentTimeDisplay',
      'timeDivider',
      'durationDisplay',
      'progressControl',
      'chromecastButton',
      'fullscreenToggle'
    ]
  }
})


    playerRef.current = player

    // ✅ Dynamically import the Silvermine Chromecast plugin
    

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
