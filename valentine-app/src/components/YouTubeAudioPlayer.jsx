import { useEffect, useRef, useCallback } from 'react'
import { buildYouTubeEmbedSrc } from '../utils/youtube'

/**
 * YouTubeAudioPlayer — plays / pauses YouTube audio without
 * reloading the iframe each time.
 *
 * Uses the YouTube IFrame Player API so that pause→resume
 * continues from the same position instead of restarting.
 */

// Load the YT IFrame API script once globally
let ytApiReady = false;
let ytApiPromise = null;

function ensureYTApi() {
  if (ytApiReady) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      ytApiReady = true;
      resolve();
      return;
    }
    // The API will call this global when ready
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      ytApiReady = true;
      if (prev) prev();
      resolve();
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

/** Extract YouTube video ID from any URL/id string */
function extractVideoId(input) {
  if (!input) return null;
  const s = String(input).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  try {
    const url = new URL(s);
    if (url.hostname.includes('youtu.be'))
      return url.pathname.replace('/', '').slice(0, 11);
    const v = url.searchParams.get('v');
    if (v) return v;
    const m = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
  } catch {}
  return null;
}

export default function YouTubeAudioPlayer({ url, playing }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const videoIdRef = useRef(null);
  const wantPlayRef = useRef(playing);

  // Keep wantPlay in sync
  wantPlayRef.current = playing;

  const videoId = extractVideoId(url);

  // Create / update player
  useEffect(() => {
    if (!videoId) return;

    let destroyed = false;

    ensureYTApi().then(() => {
      if (destroyed) return;

      // If player exists for the same video, just toggle play state
      if (playerRef.current && videoIdRef.current === videoId) {
        try {
          if (wantPlayRef.current) playerRef.current.playVideo();
          else playerRef.current.pauseVideo();
        } catch {}
        return;
      }

      // Destroy old player if video changed
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }

      videoIdRef.current = videoId;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        height: '0',
        width: '0',
        playerVars: {
          autoplay: wantPlayRef.current ? 1 : 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          loop: 1,
          playlist: videoId,
        },
        events: {
          onReady: (e) => {
            if (wantPlayRef.current) e.target.playVideo();
          },
        },
      });
    });

    return () => {
      destroyed = true;
    };
  }, [videoId]);

  // React to playing prop changes
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      const state = playerRef.current.getPlayerState?.();
      if (playing) {
        // Only call playVideo if not already playing (state 1)
        if (state !== 1) playerRef.current.playVideo();
      } else {
        // Only call pauseVideo if currently playing
        if (state === 1) playerRef.current.pauseVideo();
      }
    } catch {}
  }, [playing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="yt-audio-iframe" />;
}
