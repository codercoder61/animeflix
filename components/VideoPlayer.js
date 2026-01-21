'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import 'plyr/dist/plyr.css';

// Dynamically import Plyr to prevent SSR issues

export default function VideoPlayer({ url }) {
  const videoRef = useRef(null);


  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#000' }}>
      {url && (
        <video
          ref={videoRef}
          src={url}
          className="plyr-react"
          style={{ width: '100%', height: '100%'}}
          controls
        />
      )}
    </div>
  );
}
