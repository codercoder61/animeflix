'use client';

import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export default function VideoPlayer({ url }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [loading, setLoading] = useState(true);
const overlayStyle = {
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  zIndex: 10,
};

const spinnerStyle = {
  width: 40,
  height: 40,
  border: '4px solid rgba(255,255,255,0.3)',
  borderTop: '4px solid #fff',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

  useEffect(() => {
    if (!playerRef.current && videoRef.current && url) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        aspectRatio: '16:9',
        sources: [
          {
            src: url,
            type: 'video/mp4',
          },
        ],
      });

      const player = playerRef.current;

      // Show loader
      player.on('waiting', () => setLoading(true));

      // Hide loader
      player.on('canplay', () => setLoading(false));
      player.on('playing', () => setLoading(false));
    }

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
      {/* Loading Overlay */}
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
