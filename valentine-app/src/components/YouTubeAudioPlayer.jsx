import { useMemo } from 'react'
import { buildYouTubeEmbedSrc } from '../utils/youtube'

export default function YouTubeAudioPlayer({ url, playing }) {
  const src = useMemo(() => {
    return playing ? buildYouTubeEmbedSrc(url, { autoplay: true }) : ''
  }, [url, playing])

  // Important: most browsers require a user gesture before autoplay can work.
  // This component only starts audio after user clicks a Play button in the UI.
  return (
    <iframe
      className="yt-audio-iframe"
      title="YouTube Audio"
      src={src}
      allow="autoplay; encrypted-media"
      allowFullScreen={false}
    />
  )
}
