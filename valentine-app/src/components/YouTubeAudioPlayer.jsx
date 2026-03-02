import { useEffect, useRef } from "react";
import { ensureYTApi, parseYouTubeId } from "../utils/youtube";

/**
 * YouTubeAudioPlayer — plays / pauses YouTube audio.
 *
 * Supports optional trimming:
 *   startTime  — seconds into the track to begin playback
 *   clipDuration — how many seconds to play (0 = unlimited)
 */
export default function YouTubeAudioPlayer({
  url,
  playing,
  startTime = 0,
  clipDuration = 0,
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const videoIdRef = useRef(null);
  const wantPlayRef = useRef(playing);
  const clipTimerRef = useRef(null);
  const startTimeRef = useRef(startTime);
  const clipDurRef = useRef(clipDuration);

  wantPlayRef.current = playing;
  startTimeRef.current = startTime;
  clipDurRef.current = clipDuration;

  const videoId = parseYouTubeId(url);

  /* ── helpers ── */
  const seekAndPlay = (player) => {
    try {
      if (startTimeRef.current > 0) player.seekTo(startTimeRef.current, true);
      player.playVideo();
    } catch {}
    scheduleClipEnd();
  };

  const scheduleClipEnd = () => {
    clearClipTimer();
    const dur = clipDurRef.current;
    if (dur > 0) {
      clipTimerRef.current = setTimeout(() => {
        // Loop: seek back to start and play again
        if (playerRef.current && wantPlayRef.current) {
          seekAndPlay(playerRef.current);
        }
      }, dur * 1000);
    }
  };

  const clearClipTimer = () => {
    if (clipTimerRef.current) {
      clearTimeout(clipTimerRef.current);
      clipTimerRef.current = null;
    }
  };

  // Create / update player
  useEffect(() => {
    if (!videoId) return;
    let destroyed = false;

    ensureYTApi()
      .then(() => {
        if (destroyed) return;

        if (playerRef.current && videoIdRef.current === videoId) {
          try {
            if (wantPlayRef.current) seekAndPlay(playerRef.current);
            else {
              playerRef.current.pauseVideo();
              clearClipTimer();
            }
          } catch {}
          return;
        }

        if (playerRef.current) {
          try { playerRef.current.destroy(); } catch {}
          playerRef.current = null;
        }

        videoIdRef.current = videoId;

        try {
          const el = document.createElement("div");
          containerRef.current?.appendChild(el);

          playerRef.current = new window.YT.Player(el, {
            videoId,
            height: "0",
            width: "0",
            playerVars: {
              autoplay: wantPlayRef.current ? 1 : 0,
              controls: 0,
              rel: 0,
              modestbranding: 1,
              playsinline: 1,
              start: Math.floor(startTimeRef.current) || undefined,
            },
            events: {
              onReady: (e) => {
                if (wantPlayRef.current) seekAndPlay(e.target);
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
        if (state !== 1) seekAndPlay(playerRef.current);
      } else {
        if (state === 1) playerRef.current.pauseVideo();
        clearClipTimer();
      }
    } catch {}
  }, [playing]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearClipTimer();
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="yt-audio-iframe" />;
}
