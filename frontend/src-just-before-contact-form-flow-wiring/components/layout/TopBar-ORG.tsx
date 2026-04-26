'use client'
// src/components/layout/TopBar.tsx
// ─────────────────────────────────────────────────────────────
//  The animated heartbeat top bar.
//  Left side: gradient colour bar (always visible).
//  Right side: live ECG heartbeat waveform with engine status.
//  Color changes based on platform health state.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

type HealthState = 'healthy' | 'degraded' | 'down'

// ECG-like path points — simulates a QRS cardiac complex
const ECG_POINTS = [
  [0,   50], [15,  50], [20,  45], [25,  55],  // baseline → small dip
  [30,  20], [35,  80], [40,  10], [45,  60],  // QRS spike
  [50,  52], [60,  48], [70,  52], [85,  50],  // recovery
  [100, 50],
] as [number, number][]

function pointsToPath(pts: [number, number][], w: number, h: number): string {
  return pts
    .map(([x, y], i) => {
      const px = (x / 100) * w
      const py = (y / 100) * h
      return `${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`
    })
    .join(' ')
}

const HEALTH_COLOURS: Record<HealthState, { bar: string; ecg: string; dot: string; label: string }> = {
  healthy:  { bar: 'from-purple via-accent to-gold', ecg: '#00e5b8', dot: '#00e5b8', label: 'Engine Nominal' },
  degraded: { bar: 'from-warn via-gold to-warn',     ecg: '#ffaa33', dot: '#ffaa33', label: 'Degraded'       },
  down:     { bar: 'from-danger via-pink to-danger',  ecg: '#ff5f5f', dot: '#ff5f5f', label: 'Service Down'  },
}

export function TopBar() {
  const svgRef       = useRef<SVGSVGElement>(null)
  const pathRef      = useRef<SVGPathElement>(null)
  const canvasW      = useRef(0)
  const offsetRef    = useRef(0)
  const rafRef       = useRef<number>(0)
  const [health]     = useState<HealthState>('healthy')
  const [tick, setTick] = useState(0)

  const cfg = HEALTH_COLOURS[health]

  // Tick every second to show "live" updates
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Animate the ECG path scrolling
  useEffect(() => {
    const svg = svgRef.current
    const path = pathRef.current
    if (!svg || !path) return

    const W = svg.clientWidth || 160
    const H = svg.clientHeight || 20
    canvasW.current = W

    function animate() {
      if (!path || !svg) return
      const W2  = svg.clientWidth || 160
      const H2  = svg.clientHeight || 20
      offsetRef.current = (offsetRef.current + 0.8) % (W2 * 2)
      const d   = pointsToPath(ECG_POINTS, W2, H2)
      path.setAttribute('d', d)
      // Scroll via transform
      path.setAttribute('transform', `translate(${-offsetRef.current}, 0)`)
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] flex h-[28px] items-center overflow-hidden"
         style={{ background: 'rgba(4,8,15,0.95)' }}>

      {/* Left: gradient colour bar */}
      <div className={cn('h-full w-1.5 flex-shrink-0 bg-gradient-to-b', cfg.bar)} />

      {/* Centre gradient line */}
      <div className={cn('h-[2px] flex-1 bg-gradient-to-r opacity-70', cfg.bar)} />

      {/* Right: heartbeat region */}
      <div className="flex items-center gap-3 pr-3 pl-2 flex-shrink-0">

        {/* Status label */}
        <span className="font-mono text-[0.52rem] tracking-[0.18em] uppercase"
              style={{ color: cfg.dot }}>
          {cfg.label}
        </span>

        {/* ECG waveform — live animated */}
        <div className="relative h-5 w-[120px] overflow-hidden opacity-80">
          <svg ref={svgRef} className="h-full w-full" viewBox="0 0 120 20"
               preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            {/* Repeat the path twice for seamless loop */}
            <g>
              <path ref={pathRef} d=""
                    fill="none" stroke={cfg.ecg}
                    strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              {/* Second copy shifted right for seamless tile */}
              <path id="ecg2" d=""
                    fill="none" stroke={cfg.ecg}
                    strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                    opacity="0.5" />
            </g>
          </svg>
          {/* Right fade mask */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8"
               style={{ background: 'linear-gradient(90deg, transparent, rgba(4,8,15,0.95))' }} />
        </div>

        {/* Pulsing dot */}
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ background: cfg.dot }} />
          <span className="relative inline-flex h-2 w-2 rounded-full"
                style={{ background: cfg.dot }} />
        </span>

        {/* Tick counter */}
        <span className="font-mono text-[0.48rem] tracking-widest text-dim/60 tabular-nums">
          {String(tick).padStart(4, '0')}
        </span>

      </div>
    </div>
  )
}
