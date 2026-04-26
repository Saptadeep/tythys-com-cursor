'use client'
// src/components/ui/ParticleCanvas.tsx
// ─────────────────────────────────────────────────────────────
//  Two-layer background canvas:
//
//  LAYER 1 — Star field (starry sky)
//    Hundreds of tiny static dots at varying brightness and size.
//    Each star gently twinkles (opacity oscillation) independently.
//    A small random fraction drift very slowly like distant nebula.
//    Colors: mostly white/silver, a few warm amber, a few cool teal.
//
//  LAYER 2 — Particle network (neural mesh)
//    ~50 moving particles that connect with lines when close.
//    These are the larger, brighter teal dots from the original.
//
//  Both layers share one canvas and render every frame.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'

// ── Star type ────────────────────────────────────────────────
interface Star {
  x:       number
  y:       number
  r:       number   // radius 0.2–1.1px
  baseAlpha: number // base opacity 0.15–0.85
  alpha:   number   // current opacity
  phase:   number   // twinkle phase offset (radians)
  speed:   number   // twinkle speed multiplier
  color:   string   // 'white' | 'warm' | 'cool'
  vx:      number   // very slow drift (0 for most)
  vy:      number
}

// ── Particle type ─────────────────────────────────────────────
interface Particle {
  x:  number
  y:  number
  vx: number
  vy: number
  r:  number
}

// ── Star colors: white dominant, few warm/cool accents ────────
function starColor(type: string): string {
  switch (type) {
    case 'warm': return 'rgba(255,220,160,'
    case 'cool': return 'rgba(180,220,255,'
    default:     return 'rgba(220,228,245,'
  }
}

function pickStarType(): string {
  const r = Math.random()
  if (r < 0.08) return 'warm'
  if (r < 0.16) return 'cool'
  return 'white'
}

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W: number, H: number
    let animId: number
    let t = 0   // global time for twinkle

    // ── Stars ────────────────────────────────────────────────
    let stars: Star[] = []

    function makeStars() {
      // Density: ~1.8 stars per 10,000px² of screen area
      const count = Math.floor((W * H) / 10000 * 1.8)
      stars = Array.from({ length: count }, (): Star => {
        const drifter = Math.random() < 0.04   // 4% drift slowly
        return {
          x:         Math.random() * W,
          y:         Math.random() * H,
          r:         Math.random() * 0.85 + 0.2,
          baseAlpha: Math.random() * 0.55 + 0.2,
          alpha:     0,
          phase:     Math.random() * Math.PI * 2,
          speed:     Math.random() * 0.4 + 0.15,
          color:     pickStarType(),
          vx:        drifter ? (Math.random() - 0.5) * 0.025 : 0,
          vy:        drifter ? (Math.random() - 0.5) * 0.025 : 0,
        }
      })
    }

    // ── Particles ─────────────────────────────────────────────
    let particles: Particle[] = []

    function makeParticles() {
      const N = W < 600 ? 20 : W < 1000 ? 36 : 52
      particles = Array.from({ length: N }, (): Particle => ({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r:  Math.random() * 1.1 + 0.65,
      }))
    }

    function resize() {
      W = canvas!.width  = window.innerWidth
      H = canvas!.height = window.innerHeight
      makeStars()
      makeParticles()
    }

    resize()

    // ── Draw stars ────────────────────────────────────────────
    function drawStars() {
      for (const s of stars) {
        // Twinkle: smooth sine oscillation unique to each star
        const wave  = Math.sin(t * s.speed + s.phase)
        s.alpha     = s.baseAlpha + wave * 0.18
        s.alpha     = Math.max(0.05, Math.min(1, s.alpha))

        // Drift
        if (s.vx !== 0) {
          s.x += s.vx
          s.y += s.vy
          if (s.x < 0) s.x = W
          if (s.x > W) s.x = 0
          if (s.y < 0) s.y = H
          if (s.y > H) s.y = 0
        }

        // Very largest stars get a tiny glow halo
        if (s.r > 0.9) {
          const g = ctx!.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3.5)
          g.addColorStop(0, `${starColor(s.color)}${(s.alpha * 0.4).toFixed(3)})`)
          g.addColorStop(1, `${starColor(s.color)}0)`)
          ctx!.beginPath()
          ctx!.arc(s.x, s.y, s.r * 3.5, 0, Math.PI * 2)
          ctx!.fillStyle = g
          ctx!.fill()
        }

        // Core dot
        ctx!.beginPath()
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx!.fillStyle = `${starColor(s.color)}${s.alpha.toFixed(3)})`
        ctx!.fill()
      }
    }

    // ── Draw particle network ─────────────────────────────────
    function drawParticles() {
      const CONNECT_DIST = 145

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1

        for (let j = i + 1; j < particles.length; j++) {
          const q  = particles[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const d  = Math.hypot(dx, dy)
          if (d < CONNECT_DIST) {
            ctx!.beginPath()
            ctx!.moveTo(p.x, p.y)
            ctx!.lineTo(q.x, q.y)
            ctx!.strokeStyle = `rgba(0,229,184,${0.08 * (1 - d / CONNECT_DIST)})`
            ctx!.lineWidth   = 0.5
            ctx!.stroke()
          }
        }
      }

      // Draw particle dots on top of connections
      for (const p of particles) {
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = 'rgba(0,229,184,0.38)'
        ctx!.fill()
      }
    }

    // ── Animation loop ────────────────────────────────────────
    function frame() {
      ctx!.clearRect(0, 0, W, H)

      // Layer 1: star field
      drawStars()

      // Layer 2: particle network
      drawParticles()

      t   += 0.012   // global time — controls twinkle rate
      animId = requestAnimationFrame(frame)
    }

    frame()

    window.addEventListener('resize', resize, { passive: true })
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 h-full w-full"
      style={{ pointerEvents: 'none' }}
    />
  )
}
