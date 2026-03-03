import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { ensureYTApi, parseYouTubeId } from "../utils/youtube";

/**
 * YouTubeAudioPlayer — plays / pauses YouTube audio.
 *
 * iOS-safe design:
 *  - NO `end` playerVar (causes iOS to stop + block restart)
 *  - NO JS-based playVideo() calls outside user gestures
 *  - YouTube-native `loop: 1` + `playlist: videoId` for looping
 *  - 200×200 iframe positioned offscreen (not 1×1 — iOS throttles tiny iframes)
 *  - setVolume(100) for desktop (no-op on iOS, volume is hardware-only)
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
  const clipDurationRef = useRef(clipDuration);
  const clipTimerRef = useRef(null);

  wantPlayRef.current = playing;
  startTimeRef.current = startTime;
  clipDurationRef.current = clipDuration;

  const videoId = parseYouTubeId(url);

  // ── Clip looping: seek back to startTime when clip ends ──
  const startClipTimer = () => {
    if (clipTimerRef.current) clearInterval(clipTimerRef.current);
    const dur = clipDurationRef.current;
    const st = startTimeRef.current || 0;
    if (!dur || dur <= 0) return; // no clip — play full
    clipTimerRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p || typeof p.getCurrentTime !== 'function') return;
      try {
        const cur = p.getCurrentTime();
        if (cur >= st + dur || cur < st - 1) {
          p.seekTo(st, true);
        }
      } catch {}
    }, 500);
  };

  const stopClipTimer = () => {
    if (clipTimerRef.current) {
      clearInterval(clipTimerRef.current);
      clipTimerRef.current = null;
    }
  };

  /* ── imperative handle for direct play/pause from parent ── */
  useImperativeHandle(ref, () => ({
    play: () => {
      const p = playerRef.current;
      if (!p) return;
      try {
        p.setVolume(100);
        p.unMute();
        if (startTimeRef.current > 0) p.seekTo(startTimeRef.current, true);
        p.playVideo();
        startClipTimer();
      } catch {}
    },
    pause: () => {
      if (playerRef.current) {
        try { playerRef.current.pauseVideo(); } catch {}
      }
      stopClipTimer();
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
              playerRef.current.unMute();
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

        try {
          const el = document.createElement("div");
          containerRef.current?.appendChild(el);

          playerRef.current = new window.YT.Player(el, {
            videoId,
            height: "200",
            width: "200",
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              rel: 0,
              modestbranding: 1,
              playsinline: 1,
              start: st || undefined,
              loop: 1,
              playlist: videoId,
            },
            events: {
              onReady: (e) => {
                e.target.setVolume(100);
                e.target.unMute();
                // Do NOT auto-play here — only the imperative .play()
                // called from user gesture (envelope click) should start.
                // This prevents iOS from blocking audio.
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
        playerRef.current.unMute();
        if (state !== 1) {
          if (startTimeRef.current > 0) {
            playerRef.current.seekTo(startTimeRef.current, true);
          }
          playerRef.current.playVideo();
        }
        startClipTimer();
      } else {
        if (state === 1) playerRef.current.pauseVideo();
        stopClipTimer();
      }
    } catch {}
  }, [playing]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopClipTimer();
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="yt-audio-iframe" />;
});

export default YouTubeAudioPlayer;
