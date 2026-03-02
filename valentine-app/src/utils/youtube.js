// ── YT IFrame API loader (singleton) ──
let _ytApiReady = false;
let _ytApiPromise = null;

export function ensureYTApi() {
  if (_ytApiReady) return Promise.resolve();
  if (_ytApiPromise) return _ytApiPromise;
  _ytApiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      _ytApiReady = true;
      resolve();
      return;
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      _ytApiReady = true;
      if (prev) prev();
      resolve();
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
  return _ytApiPromise;
}

export function parseYouTubeId(input) {
  if (!input) return null
  const value = String(input).trim()

  // Accept raw ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value

  // Try URL parsing
  try {
    const url = new URL(value)

    // youtu.be/<id>
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace('/', '').slice(0, 11)
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null
    }

    // youtube.com/watch?v=<id>
    const v = url.searchParams.get('v')
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v

    // youtube.com/embed/<id>
    const match = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/)
    if (match) return match[1]

    return null
  } catch {
    return null
  }
}

export function buildYouTubeEmbedSrc(input, { autoplay } = { autoplay: false }) {
  if (!input) return ''

  // If user pasted an embed URL already, keep it but normalize autoplay/controls.
  if (String(input).includes('youtube.com/embed/')) {
    try {
      const url = new URL(String(input).trim())
      url.searchParams.set('autoplay', autoplay ? '1' : '0')
      url.searchParams.set('controls', '0')
      url.searchParams.set('rel', '0')
      url.searchParams.set('modestbranding', '1')
      return url.toString()
    } catch {
      // fallthrough
    }
  }

  const id = parseYouTubeId(input)
  if (!id) return ''

  const url = new URL(`https://www.youtube.com/embed/${id}`)
  url.searchParams.set('autoplay', autoplay ? '1' : '0')
  url.searchParams.set('controls', '0')
  url.searchParams.set('rel', '0')
  url.searchParams.set('modestbranding', '1')
  url.searchParams.set('playsinline', '1')
  // Loop only works reliably with playlist param.
  url.searchParams.set('loop', '1')
  url.searchParams.set('playlist', id)
  return url.toString()
}

export function buildYouTubeEmbedVideoSrc(
  input,
  { autoplay = true, muted = true } = { autoplay: true, muted: true }
) {
  if (!input) return ''

  // If user pasted an embed URL already, keep it but normalize autoplay/controls.
  if (String(input).includes('youtube.com/embed/')) {
    try {
      const url = new URL(String(input).trim())
      url.searchParams.set('autoplay', autoplay ? '1' : '0')
      url.searchParams.set('mute', muted ? '1' : '0')
      url.searchParams.set('controls', '0')
      url.searchParams.set('rel', '0')
      url.searchParams.set('modestbranding', '1')
      url.searchParams.set('playsinline', '1')
      // Loop only works reliably with playlist param.
      const id = parseYouTubeId(input)
      if (id) {
        url.searchParams.set('loop', '1')
        url.searchParams.set('playlist', id)
      }
      return url.toString()
    } catch {
      // fallthrough
    }
  }

  const id = parseYouTubeId(input)
  if (!id) return ''

  const url = new URL(`https://www.youtube.com/embed/${id}`)
  url.searchParams.set('autoplay', autoplay ? '1' : '0')
  url.searchParams.set('mute', muted ? '1' : '0')
  url.searchParams.set('controls', '0')
  url.searchParams.set('rel', '0')
  url.searchParams.set('modestbranding', '1')
  url.searchParams.set('playsinline', '1')
  url.searchParams.set('loop', '1')
  url.searchParams.set('playlist', id)
  return url.toString()
}
