import { useEffect, useState, useRef } from 'react'

function createParticle(x, y) {
  const angle = Math.random() * Math.PI * 2
  const speed = 60 + Math.random() * 120
  const hue = Math.random() * 360
  const size = 3 + Math.random() * 4
  return {
    id: Math.random(),
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1,
    decay: 0.012 + Math.random() * 0.015,
    hue, size,
    trail: [],
  }
}

function createBurst(cx, cy) {
  const count = 30 + Math.floor(Math.random() * 20)
  return Array.from({ length: count }, () => createParticle(cx, cy))
}

export default function Fireworks({ active = true, duration = 8000 }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particlesRef = useRef([])
  const [visible, setVisible] = useState(active)

  useEffect(() => {
    if (!active) return
    setVisible(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let lastBurst = 0
    const burstInterval = 600

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn new bursts
      if (time - lastBurst > burstInterval) {
        const cx = canvas.width * 0.15 + Math.random() * canvas.width * 0.7
        const cy = canvas.height * 0.1 + Math.random() * canvas.height * 0.4
        particlesRef.current.push(...createBurst(cx, cy))
        lastBurst = time
      }

      // Update & draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx * 0.016
        p.y += p.vy * 0.016
        p.vy += 80 * 0.016 // gravity
        p.vx *= 0.98
        p.vy *= 0.98
        p.life -= p.decay

        if (p.life <= 0) return false

        // Draw glow
        const alpha = p.life * 0.8
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${alpha})`
        ctx.shadowBlur = 15
        ctx.shadowColor = `hsla(${p.hue}, 100%, 60%, ${alpha * 0.5})`
        ctx.fill()
        ctx.shadowBlur = 0

        // Sparkle tail
        if (p.life > 0.3) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 0.4 * p.life, 0, Math.PI * 2)
          ctx.fillStyle = `hsla(${p.hue}, 100%, 90%, ${alpha * 0.6})`
          ctx.fill()
        }

        return true
      })

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    const timeout = setTimeout(() => {
      setVisible(false)
    }, duration)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      clearTimeout(timeout)
    }
  }, [active, duration])

  if (!visible) return null

  return (
    <canvas
      ref={canvasRef}
      className="fireworks-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 999,
      }}
    />
  )
}
