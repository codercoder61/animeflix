'use client';

import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export default function VideoPlayer({ url }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current && videoRef.current && url) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,           // responsive player
        aspectRatio: '16:9',   // 👈 important
        sources: [
          {
            src: url,
            type: 'video/mp4',
          },
        ],
      });
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
        width: '100%',
        maxWidth: '100%',
        backgroundColor: '#000',
        overflow: 'hidden', // 👈 prevents bleed
      }}
    >
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-default-skin vjs-big-play-centered"
        />
      </div>
    </div>
  );
}
