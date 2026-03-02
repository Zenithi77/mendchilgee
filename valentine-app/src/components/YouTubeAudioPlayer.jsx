import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { ensureYTApi, parseYouTubeId } from "../utils/youtube";

/**
 * YouTubeAudioPlayer — plays / pauses YouTube audio.
 *
 * iOS-safe: uses YouTube-native loop + start/end playerVars
 * instead of JS setTimeout-based looping (which iOS blocks
 * because playVideo() calls outside user gestures are rejected).
 *
 * Volume is explicitly set to 100 on every play action.
 */
const YouTubeAudioPlayer = forwardRef(function YouTubeAudioPlayer({
  url,
  playing,
  startTime = 0,
  clipDuration = 0,
}, ref) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const videoIdRef = useRef(null);
  const wantPlayRef = useRef(playing);
  const startTimeRef = useRef(startTime);
  const clipDurRef = useRef(clipDuration);

  wantPlayRef.current = playing;
  startTimeRef.current = startTime;
  clipDurRef.current = clipDuration;

  const videoId = parseYouTubeId(url);

  /* ── imperative handle for direct play/pause from parent ── */
  useImperativeHandle(ref, () => ({
    play: () => {
      const p = playerRef.current;
      if (!p) return;
      try {
        p.setVolume(100);
        if (startTimeRef.current > 0) p.seekTo(startTimeRef.current, true);
        p.playVideo();
      } catch {}
    },
    pause: () => {
      if (playerRef.current) {
        try { playerRef.current.pauseVideo(); } catch {}
      }
    },
  }));

  // Create / update player
  useEffect(() => {
    if (!videoId) return;
    let destroyed = false;

    ensureYTApi()
      .then(() => {
        if (destroyed) return;

        // Same video — just toggle play state
        if (playerRef.current && videoIdRef.current === videoId) {
          try {
            if (wantPlayRef.current) {
              playerRef.current.setVolume(100);
              playerRef.current.playVideo();
            } else {
              playerRef.current.pauseVideo();
            }
          } catch {}
          return;
        }

        // Destroy old player
        if (playerRef.current) {
          try { playerRef.current.destroy(); } catch {}
          playerRef.current = null;
        }

        videoIdRef.current = videoId;

        const st = Math.floor(startTimeRef.current) || 0;
        const dur = clipDurRef.current;
        const endTime = dur > 0 ? st + dur : undefined;

        try {
          const el = document.createElement("div");
          containerRef.current?.appendChild(el);

          playerRef.current = new window.YT.Player(el, {
            videoId,
            height: "1",
            width: "1",
            playerVars: {
              autoplay: wantPlayRef.current ? 1 : 0,
              controls: 0,
              rel: 0,
              modestbranding: 1,
              playsinline: 1,
              start: st || undefined,
              end: endTime,
              loop: 1,
              playlist: videoId,
            },
            events: {
              onReady: (e) => {
                e.target.setVolume(100);
                if (wantPlayRef.current) {
                  if (st > 0) e.target.seekTo(st, true);
                  e.target.playVideo();
                }
              },
              onStateChange: (e) => {
                // When video ends (state 0) and we still want music,
                // seek back to clip start. This keeps the audio session
                // alive on iOS without needing a new user gesture.
                if (e.data === 0 && wantPlayRef.current) {
                  try {
                    e.target.seekTo(st, true);
                    e.target.playVideo();
                  } catch {}
                }
                // If YouTube somehow paused (state 2) but we want play
                if (e.data === 2 && wantPlayRef.current) {
                  try {
                    e.target.setVolume(100);
                    e.target.playVideo();
                  } catch {}
                }
              },
              onError: () => {
                console.warn("YouTube player error for video:", videoId);
              },
            },
          });
        } catch (err) {
          console.warn("Failed to create YouTube player:", err);
        }
      })
      .catch((err) => {
        console.warn("Failed to load YouTube API:", err);
      });

    return () => { destroyed = true; };
  }, [videoId]);

  // React to playing prop changes
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      const state = playerRef.current.getPlayerState?.();
      if (playing) {
        playerRef.current.setVolume(100);
        if (state !== 1) {
          if (startTimeRef.current > 0) {
            playerRef.current.seekTo(startTimeRef.current, true);
          }
          playerRef.current.playVideo();
        }
      } else {
        if (state === 1) playerRef.current.pauseVideo();
      }
    } catch {}
  }, [playing]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="yt-audio-iframe" />;
});

export default YouTubeAudioPlayer;
