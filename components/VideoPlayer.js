'use client';

import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export default function VideoPlayer({ url }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url || playerRef.current) return;

    const initPlayer = () => {
      if (!videoRef.current || !document.body.contains(videoRef.current)) {
        requestAnimationFrame(initPlayer);
        return;
      }

      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        aspectRatio: '16:9',
        sources: [{ src: url, type: 'video/mp4' }],
      });

      const player = playerRef.current;

      player.on('waiting', () => setLoading(true));
      player.on('canplay', () => setLoading(false));
      player.on('playing', () => setLoading(false));
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [url]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#000',
        overflow: 'hidden',
      }}
    >
      {loading && (
        <div style={overlayStyle}>
          <div style={spinnerStyle} />
          <span style={{ marginTop: 12 }}>Loading video…</span>
        </div>
      )}

      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
        />
      </div>
    </div>
  );
}
