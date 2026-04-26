'use client'
// src/components/hud/HUD.tsx
// ─────────────────────────────────────────────────────────────
//  Industry-grade HUD panel — fixed bottom-right.
//
//  Sections (top → bottom):
//    HEADER      — logo, version, master health dot
//    ECG         — live scrolling heartbeat waveform + latency
//    SERVICES    — colour-coded per-service status + latency
//    METRICS     — uptime / build date grid
//    FOOTER      — env badge, mini resource bars, last-event log,
//                  quick-link icons, copyright strip
//
//  Collapses to a small pill tab when closed.
//  Border + tab colour tracks overall health state.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence }      from 'motion/react'
import {
  Activity, ChevronDown, ChevronUp,
  Cpu, Server, Clock, ExternalLink,
  GitBranch, Radio, MemoryStick, Gauge,
  BookOpen, CircleHelp, Globe,
} from 'lucide-react'
import { fmtUptime } from '@/lib/cn'

// ── Types ──────────────────────────────────────────────────
type Health = 'healthy' | 'degraded' | 'down' | 'unknown'

interface ServiceStatus {
  name:    string
  health:  Health
  latency: number
}

// ── Health config ─────────────────────────────────────────
const HC: Record<Health, { color: string; label: string }> = {
  healthy:  { color: '#00e5b8', label: 'Nominal'  },
  degraded: { color: '#ffaa33', label: 'Degraded' },
  down:     { color: '#ff5f5f', label: 'Down'     },
  unknown:  { color: '#7a8a9e', label: 'Unknown'  },
}

// ── ECG waveform on canvas ────────────────────────────────
function generateECG(W: number, H: number, offset: number): string {
  const period = W * 0.7
  const mid    = H * 0.55
  const pts: string[] = []

  for (let x = -period; x <= W + period; x += 2) {
    const t = ((x + offset) % period) / period
    let y = mid
    if      (t < 0.20) y = mid
    else if (t < 0.25) y = mid - H * 0.15 * Math.sin(((t - 0.20) / 0.05) * Math.PI)
    else if (t < 0.30) y = mid + H * 0.10 * Math.sin(((t - 0.25) / 0.05) * Math.PI)
    else if (t < 0.35) y = mid - H * 0.65 * Math.sin(((t - 0.30) / 0.05) * Math.PI)
    else if (t < 0.40) y = mid + H * 0.25 * Math.sin(((t - 0.35) / 0.05) * Math.PI)
    else if (t < 0.50) y = mid - H * 0.08 * Math.sin(((t - 0.40) / 0.10) * Math.PI)
    else               y = mid
    if (x >= 0 && x <= W)
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return pts.join(' ')
}

function HeartbeatCanvas({ color }: { color: string }) {
  const ref    = useRef<HTMLCanvasElement>(null)
  const offRef = useRef(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const cvs = ref.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    if (!ctx) return

    function draw() {
      if (!cvs || !ctx) return
      const W = cvs.width, H = cvs.height
      ctx.clearRect(0, 0, W, H)

      // Glow trail
      const g = ctx.createLinearGradient(0, 0, W, 0)
      g.addColorStop(0,   'transparent')
      g.addColorStop(0.5, color + '18')
      g.addColorStop(1,   color + '70')
      ctx.beginPath()
      ctx.strokeStyle = g
      ctx.lineWidth   = 0.8
      ctx.stroke(new Path2D(generateECG(W, H, offRef.current)))

      // Crisp line
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth   = 1.4
      ctx.globalAlpha = 0.88
      ctx.stroke(new Path2D(generateECG(W, H, offRef.current)))
      ctx.globalAlpha = 1

      offRef.current  = (offRef.current + 1.15) % (W * 0.7)
      rafRef.current  = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [color])

  return <canvas ref={ref} width={240} height={34} className="w-full" style={{ height: 34 }} />
}

// ── Status dot ────────────────────────────────────────────
function Dot({ health }: { health: Health }) {
  const c = HC[health].color
  return (
    <span className="relative flex h-2 w-2 flex-shrink-0">
      {health === 'healthy' && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
              style={{ background: c }} />
      )}
      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: c }} />
    </span>
  )
}

// ── Mini resource bar ─────────────────────────────────────
function ResourceBar({
  label, value, color, icon: Icon,
}: {
  label: string; value: number; color: string; icon: React.ElementType
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Icon size={8} style={{ color }} />
          <span className="font-mono text-[0.52rem] uppercase tracking-wider text-[#7a8a9e]">{label}</span>
        </div>
        <span className="font-mono text-[0.52rem] tabular-nums" style={{ color }}>
          {value}%
        </span>
      </div>
      {/* Track */}
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ background: color }}
        />
      </div>
    </div>
  )
}

// ── Main HUD ──────────────────────────────────────────────
export function HUD() {
  const [open,    setOpen]    = useState(false)
  const [uptime,  setUptime]  = useState(0)
  const [latency, setLatency] = useState(42)
  const [mem,     setMem]     = useState(34)
  const [cpu,     setCpu]     = useState(18)
  const [lastEvt, setLastEvt] = useState('System initialized')
  const startRef = useRef(Date.now())
  const rootRef  = useRef<HTMLDivElement>(null)

  // Uptime ticker
  useEffect(() => {
    const id = setInterval(
      () => setUptime(Math.floor((Date.now() - startRef.current) / 1000)),
      1000,
    )
    return () => clearInterval(id)
  }, [])

  // Latency jitter
  useEffect(() => {
    const id = setInterval(() => {
      setLatency(p => Math.max(14, Math.min(115, p + Math.round((Math.random() - 0.5) * 11))))
    }, 2200)
    return () => clearInterval(id)
  }, [])

  // Memory / CPU jitter
  useEffect(() => {
    const id = setInterval(() => {
      setMem(p  => Math.max(20, Math.min(85, p + Math.round((Math.random() - 0.5) * 5))))
      setCpu(p  => Math.max(5,  Math.min(70, p + Math.round((Math.random() - 0.5) * 8))))
    }, 3000)
    return () => clearInterval(id)
  }, [])

  // Simulated last-event log rotation
  useEffect(() => {
    const events = [
      'Beam calc request processed',
      'Canvas render completed',
      'Health check passed',
      'CDN edge hit — 4ms',
      'API gateway heartbeat OK',
      'Auth token refreshed',
    ]
    let idx = 0
    const id = setInterval(() => {
      idx = (idx + 1) % events.length
      setLastEvt(events[idx])
    }, 5000)
    return () => clearInterval(id)
  }, [])

  // Close HUD when clicking anywhere outside the HUD root.
  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  const services: ServiceStatus[] = [
    { name: 'API Gateway', health: 'healthy', latency },
    { name: 'Beam Calc',   health: 'healthy', latency: Math.max(8, latency - 8) },
    { name: 'Auth',        health: 'healthy', latency: 12 },
    { name: 'CDN',         health: 'healthy', latency: 4  },
  ]

  const overall: Health = services.every(s => s.health === 'healthy') ? 'healthy'
    : services.some(s => s.health === 'down')     ? 'down'
    : 'degraded'

  const bc = HC[overall].color   // border / accent colour for current health

  // ─────────────────────────────────────────────────────────
  return (
    <div ref={rootRef} className="fixed bottom-5 right-4 z-[150] flex flex-col items-end gap-1.5 sm:bottom-6 sm:right-5">
      {/* ── Expanded panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit   ={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="hud-panel w-[262px] overflow-hidden rounded-2xl"
            style={{
              borderColor: `${bc}4a`,
              boxShadow: `0 0 0 1px ${bc}24, 0 14px 34px rgba(0,0,0,0.42)`,
            }}
          >

            {/* ── 1. HEADER ── */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Cpu size={11} className="text-accent" />
                <span className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-accent">
                  Tythys HUD
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[0.5rem] text-[#7a8a9e]">v1.0.0</span>
                <Dot health={overall} />
              </div>
            </div>

            {/* ── 2. ECG WAVEFORM ── */}
            <div className="border-b border-white/5 px-3 py-2">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Radio size={8} style={{ color: bc }} />
                  <span className="font-mono text-[0.52rem] uppercase tracking-wider text-[#7a8a9e]">
                    Engine Signal
                  </span>
                </div>
                <span className="font-mono text-[0.52rem] tabular-nums" style={{ color: bc }}>
                  {latency}ms
                </span>
              </div>
              <div className="overflow-hidden rounded-md bg-black/30 px-2 py-1">
                <HeartbeatCanvas color={bc} />
              </div>
            </div>

            {/* ── 3. SERVICES ── */}
            <div className="border-b border-white/5 px-4 py-2.5">
              <p className="mb-2 font-mono text-[0.52rem] uppercase tracking-wider text-[#7a8a9e]">
                Services
              </p>
              <div className="flex flex-col gap-1.5">
                {services.map(svc => (
                  <div key={svc.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Dot health={svc.health} />
                      <span className="font-mono text-[0.6rem] text-[#dde4f0]">{svc.name}</span>
                    </div>
                    <span className="font-mono text-[0.56rem] tabular-nums text-[#7a8a9e]">
                      {svc.latency}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 4. UPTIME / BUILD METRICS ── */}
            <div className="grid grid-cols-2 border-b border-white/5">
              <div className="flex flex-col gap-0.5 border-r border-white/5 px-4 py-2.5">
                <div className="flex items-center gap-1.5 text-[#7a8a9e]">
                  <Clock size={8} />
                  <span className="font-mono text-[0.5rem] uppercase tracking-wider">Uptime</span>
                </div>
                <span className="font-mono text-[0.68rem] font-medium text-[#dde4f0] tabular-nums">
                  {fmtUptime(uptime)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 px-4 py-2.5">
                <div className="flex items-center gap-1.5 text-[#7a8a9e]">
                  <GitBranch size={8} />
                  <span className="font-mono text-[0.5rem] uppercase tracking-wider">Build</span>
                </div>
                <span className="font-mono text-[0.68rem] font-medium text-[#dde4f0]">
                  {new Date().toISOString().split('T')[0]}
                </span>
              </div>
            </div>

            {/* ── 5. FOOTER ─────────────────────────────────────────
                  A) Environment badge + resource bars
                  B) Last-event log line
                  C) Quick links
                  D) Signature strip
            ──────────────────────────────────────────────────── */}
            <div className="border-b border-white/5 px-4 py-3">

              {/* 5A: Environment + resource bars */}
              <div className="mb-2.5 flex items-center justify-between">
                {/* ENV badge */}
                <span
                  className="rounded border px-2 py-0.5 font-mono text-[0.5rem] tracking-widest uppercase"
                  style={{
                    background:  'rgba(0,229,184,0.07)',
                    borderColor: 'rgba(0,229,184,0.22)',
                    color:       '#00e5b8',
                  }}
                >
                  PROD
                </span>
                {/* Stack label */}
                <span className="font-mono text-[0.5rem] tracking-wider text-[#7a8a9e]/60">
                  Next.js 15 · Python 3.11
                </span>
              </div>

              {/* 5A: Resource bars */}
              <div className="flex flex-col gap-2">
                <ResourceBar label="Memory" value={mem} color="#8b7fff" icon={MemoryStick} />
                <ResourceBar label="CPU"    value={cpu} color="#ffcb47" icon={Gauge}       />
              </div>
            </div>

            {/* 5B: Last event log */}
            <div className="border-b border-white/5 px-4 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Server size={8} className="text-[#7a8a9e]" />
                <span className="font-mono text-[0.5rem] uppercase tracking-wider text-[#7a8a9e]">
                  Last Event
                </span>
              </div>
              <motion.p
                key={lastEvt}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1,  x:  0 }}
                transition={{ duration: 0.3 }}
                className="font-mono text-[0.58rem] text-[#dde4f0]/75 truncate"
              >
                <span style={{ color: bc }}>▸</span> {lastEvt}
              </motion.p>
            </div>

            {/* 5C: Quick links */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
              <span className="font-mono text-[0.5rem] uppercase tracking-wider text-[#7a8a9e]">
                Links
              </span>
              <div className="flex items-center gap-3">
                {[
                  { icon: Globe,      label: 'Site',   href: '#' },
                  { icon: BookOpen,   label: 'Docs',   href: '#' },
                  { icon: CircleHelp, label: 'Status', href: '#' },
                  { icon: ExternalLink, label: 'API',  href: '#' },
                ].map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    title={label}
                    className="flex items-center justify-center rounded p-1 text-[#7a8a9e] transition-colors hover:text-accent"
                    style={{ minWidth: 22, minHeight: 22 }}
                  >
                    <Icon size={10} />
                  </a>
                ))}
              </div>
            </div>

            {/* 5D: Signature strip */}
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-[0.48rem] text-[#7a8a9e]/50 tracking-wider">
                tythys.com
              </span>
              <span className="font-mono text-[0.48rem] text-[#7a8a9e]/40">
                © 2025 Tythys
              </span>
            </div>

            {/* Bottom health-state glow line */}
            <div className="h-[2px] w-full" style={{
              background: `linear-gradient(90deg, transparent, ${bc}70, transparent)`,
            }} />

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Collapse tab ── */}
      {/* ── Collapse tab ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-all duration-200 hover:opacity-90 active:scale-95"
        style={{
          background:     'rgba(4,8,15,0.92)',
          border:         `1px solid ${bc}40`,
          backdropFilter: 'blur(16px)',
          color:          bc,
        }}
      >
        <Activity size={10} />
        <span className="font-mono text-[0.56rem] tracking-wider uppercase">
          {HC[overall].label}
        </span>
        {open ? <ChevronDown size={9} /> : <ChevronUp size={9} />}
      </button>
    </div>
  )
}
