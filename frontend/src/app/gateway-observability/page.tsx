'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import {
  Activity,
  AlertTriangle,
  Bell,
  CircleDot,
  Gauge,
  Network,
  Radio,
  ShieldCheck,
  TrendingUp,
  Waves,
  X,
} from 'lucide-react'
import { TopBar } from '@/components/layout/Topbar'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ParticleCanvas } from '@/components/ui/ParticleCanvas'
import { HUD } from '@/components/hud/HUD'
import { cn } from '@/lib/cn'

type Health = 'healthy' | 'degraded' | 'down'

type SummaryData = {
  serviceId: string
  health: Health
  latencyMs: number
  uptimePct: number
  requestsPerMin: number
  errorRatePct: number
  notes?: string
}

type IngestData = {
  service_id: string | null
  total_events: number
  last_event_at: string | null
  recent_event_count: number
  error_events_last_window: number
}

type Incident = {
  id: string
  title: string
  severity: string
  route: string | null
  estimated_loss_per_hour_usd: number
  affected_traffic_pct: number
}

type Action = { rank: number; title: string; rationale: string }
type Endpoint = {
  route: string
  health: Health
  request_count: number
  error_count: number
  p95_latency_ms: number
}
type TimelineEvent = { ts: string; kind: string; message: string }

type ApiResponse<T> = { ok: boolean; data?: T; error?: string }

/* ─── Severity / health → token tints (mirrors landing palette) ─── */
function healthTint(health: string) {
  if (health === 'healthy') return 'border-ok/40 bg-ok/[0.08] text-ok'
  if (health === 'degraded') return 'border-warn/40 bg-warn/[0.08] text-warn'
  if (health === 'down') return 'border-danger/40 bg-danger/[0.08] text-danger'
  return 'border-dim/40 bg-dim/[0.08] text-dim'
}

function severityTint(severity: string) {
  const s = severity.toLowerCase()
  if (s.includes('crit') || s.includes('high') || s === 'down')
    return 'border-danger/40 bg-danger/[0.08] text-danger'
  if (s.includes('warn') || s.includes('med') || s === 'degraded')
    return 'border-warn/40 bg-warn/[0.08] text-warn'
  if (s.includes('low') || s === 'healthy' || s === 'ok')
    return 'border-ok/40 bg-ok/[0.08] text-ok'
  return 'border-accent/30 bg-accent/[0.06] text-accent'
}

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  }
}

export default function GatewayObservabilityPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNominal, setShowNominal] = useState(false)
  const [summary, setSummary] = useState<SummaryData | undefined>()
  const [ingest, setIngest] = useState<IngestData | undefined>()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [actions, setActions] = useState<Action[]>([])
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  /* ─── Live data fetch (15s heartbeat) ─── */
  useEffect(() => {
    let mounted = true

    async function load() {
      setError(null)
      try {
        const results = await Promise.all([
          fetch('/api/services/api-gateway-observability').then(
            (r) => r.json() as Promise<ApiResponse<SummaryData>>,
          ),
          fetch('/api/ingest/latest').then(
            (r) => r.json() as Promise<ApiResponse<IngestData>>,
          ),
          fetch('/api/incidents/current').then(
            (r) => r.json() as Promise<ApiResponse<Incident[]>>,
          ),
          fetch('/api/actions/prioritized').then(
            (r) => r.json() as Promise<ApiResponse<Action[]>>,
          ),
          fetch('/api/endpoints/health').then(
            (r) => r.json() as Promise<ApiResponse<Endpoint[]>>,
          ),
          fetch('/api/timeline').then(
            (r) => r.json() as Promise<ApiResponse<TimelineEvent[]>>,
          ),
        ])

        if (!mounted) return

        const [s, i, inc, act, ep, tl] = results
        if (!s.ok || !s.data) {
          setError(s.error ?? 'Gateway summary is unavailable.')
        } else {
          setSummary(s.data)
        }
        if (i.ok && i.data) setIngest(i.data)
        if (inc.ok && inc.data) setIncidents(inc.data)
        if (act.ok && act.data) setActions(act.data)
        if (ep.ok && ep.data) setEndpoints(ep.data)
        if (tl.ok && tl.data) setTimeline(tl.data)
        setLastUpdate(new Date())
      } catch {
        if (mounted) setError('Failed to reach gateway telemetry endpoints.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    const id = setInterval(load, 15_000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])

  const health: Health = summary?.health ?? 'healthy'
  const totalIncidents = incidents.length
  const degradedEndpoints = endpoints.filter((e) => e.health !== 'healthy').length
  const topIncidents = incidents.slice(0, 4)
  const topActions = actions.slice(0, 4)
  const topEndpoints = endpoints.slice(0, 5)
  const topTimeline = timeline.slice(0, 6)

  const nominalLabel = useMemo(() => {
    if (loading && !summary) return 'Synchronising'
    if (health === 'healthy') return 'Nominal'
    if (health === 'degraded') return 'Degraded'
    return 'Down'
  }, [loading, summary, health])

  return (
    <>
      <ParticleCanvas />
      <TopBar />
      <Navbar />
      <HUD />

      <main
        className="relative z-10"
        style={{ paddingTop: 'calc(28px + 56px + 1.5rem)' }}
      >
        {/* ─── Hero / status band ─────────────────────────────────── */}
        <HeroBand
          health={health}
          nominalLabel={nominalLabel}
          summary={summary}
          totalIncidents={totalIncidents}
          degradedEndpoints={degradedEndpoints}
          showNominal={showNominal}
          setShowNominal={setShowNominal}
          lastUpdate={lastUpdate}
          error={error}
        />

        {/* ─── KPI / signal grid ──────────────────────────────────── */}
        <KpiGrid summary={summary} ingest={ingest} />

        {/* ─── Risk Snapshot + Telemetry Intake ───────────────────── */}
        <RiskAndIntake
          summary={summary}
          ingest={ingest}
          totalIncidents={totalIncidents}
          degradedEndpoints={degradedEndpoints}
        />

        {/* ─── Incidents + Fix-First ──────────────────────────────── */}
        <IncidentAndFixFirst incidents={topIncidents} actions={topActions} />

        {/* ─── Endpoint Health + Live Timeline ────────────────────── */}
        <EndpointAndTimeline endpoints={topEndpoints} timeline={topTimeline} />

        {/* ─── Operational Readiness footer card ──────────────────── */}
        <ReadinessFooter
          summary={summary}
          ingest={ingest}
          totalIncidents={totalIncidents}
          degradedEndpoints={degradedEndpoints}
        />
      </main>

      <Footer />
    </>
  )
}

/* ───────────────────────────────────────────────────────────────────
   Sections
   ─────────────────────────────────────────────────────────────────── */

function HeroBand({
  health,
  nominalLabel,
  summary,
  totalIncidents,
  degradedEndpoints,
  showNominal,
  setShowNominal,
  lastUpdate,
  error,
}: {
  health: Health
  nominalLabel: string
  summary: SummaryData | undefined
  totalIncidents: number
  degradedEndpoints: number
  showNominal: boolean
  setShowNominal: (fn: (s: boolean) => boolean) => void
  lastUpdate: Date | null
  error: string | null
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <section
      ref={ref}
      className="relative z-10 bg-grid"
      style={{
        background:
          'linear-gradient(180deg, transparent, rgba(0,229,184,0.022) 50%, transparent)',
      }}
    >
      {/* radial accents (mirror Hero) */}
      <div
        className="pointer-events-none absolute left-[-6%] top-[10%] h-[55vw] w-[55vw] max-h-[480px] max-w-[480px] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse, rgba(0,229,184,0.05) 0%, transparent 65%)',
        }}
      />
      <div
        className="pointer-events-none absolute right-[-4%] top-[20%] h-[34vw] w-[34vw] max-h-[360px] max-w-[360px] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse, rgba(139,127,255,0.045) 0%, transparent 65%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-[1300px] px-4 pb-10 pt-6 sm:px-7 md:px-10 lg:px-16 xl:px-20">
        <motion.div
          {...fadeUp(0)}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.06] px-4 py-1.5"
        >
          <span className="relative flex h-[5px] w-[5px]">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-[5px] w-[5px] rounded-full bg-accent" />
          </span>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-accent">
            GatewaySight · Live Operations
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.08)}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-4 font-display font-light leading-[1.04] tracking-[-0.025em] text-[#dde4f0]"
          style={{ fontSize: 'clamp(1.8rem, 6vw, 3.4rem)' }}
        >
          API gateway,{' '}
          <em className="title-accent">observed in real time.</em>
        </motion.h1>

        <motion.p
          {...fadeUp(0.16)}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-7 max-w-[640px] font-light leading-[1.7] text-dim"
          style={{ fontSize: 'clamp(0.86rem, 2.5vw, 0.97rem)' }}
        >
          Reliability posture, incident pressure and fix-first actions for the
          gateway tier — distilled into a focused operations view.
        </motion.p>

        {/* Status pill row */}
        <motion.div
          {...fadeUp(0.22)}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            onClick={() => setShowNominal((s) => !s)}
            className={cn(
              'status-badge transition-all duration-200 hover:-translate-y-0.5',
              healthTint(health),
            )}
          >
            <CircleDot size={10} />
            {nominalLabel}
          </button>
          <span className="status-badge border-accent/30 bg-accent/[0.06] text-accent">
            <Radio size={10} />
            Live telemetry
          </span>
          <span
            className={cn(
              'status-badge',
              totalIncidents > 0
                ? 'border-warn/40 bg-warn/[0.08] text-warn'
                : 'border-accent/30 bg-accent/[0.06] text-accent',
            )}
          >
            <AlertTriangle size={10} />
            {totalIncidents} incident{totalIncidents === 1 ? '' : 's'}
          </span>
          <span
            className={cn(
              'status-badge',
              degradedEndpoints > 0
                ? 'border-danger/40 bg-danger/[0.08] text-danger'
                : 'border-accent/30 bg-accent/[0.06] text-accent',
            )}
          >
            <Network size={10} />
            {degradedEndpoints} degraded route{degradedEndpoints === 1 ? '' : 's'}
          </span>
          <span className="status-badge border-gold/30 bg-gold/[0.06] text-gold">
            <Gauge size={10} />
            {summary ? `${summary.uptimePct.toFixed(2)}%` : '—'} uptime
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-dim">
            <Activity size={10} />
            {lastUpdate
              ? `Updated ${lastUpdate.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}`
              : 'Awaiting first signal'}
          </span>
        </motion.div>

        {/* Nominal popup — inherits glass-card/border styling */}
        {showNominal && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-4 max-w-[520px] rounded-2xl border border-accent-dim p-5"
            style={{
              background: 'rgba(10,20,42,0.92)',
              backdropFilter: 'blur(20px)',
              boxShadow:
                '0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow mb-2">Status definition</p>
                <h3 className="mb-2 font-display text-[1.05rem] font-semibold text-[#dde4f0]">
                  What &ldquo;{nominalLabel}&rdquo; means
                </h3>
                <p className="text-[0.83rem] font-light leading-[1.65] text-dim">
                  Gateway latency, error rate and ingestion pressure are within
                  expected operating envelopes. Alerts remain armed; this badge
                  reflects the live summary signal and updates automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNominal(() => false)}
                className="rounded-full border border-accent/20 bg-accent/[0.05] p-1.5 text-accent transition-colors hover:bg-accent/15"
                aria-label="Close"
              >
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}

        {error && (
          <p className="mt-4 inline-flex items-center gap-2 text-[0.82rem] text-danger">
            <AlertTriangle size={12} />
            {error}
          </p>
        )}
      </div>
    </section>
  )
}

/* ─── KPI Grid (3 columns of glass cards w/ mini trend bars) ───────── */
function KpiGrid({
  summary,
  ingest,
}: {
  summary: SummaryData | undefined
  ingest: IngestData | undefined
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const items = [
    {
      label: 'P95 Latency',
      value: summary ? `${summary.latencyMs}` : '—',
      unit: 'ms',
      caption: 'Route response under current load',
      score: summary
        ? Math.max(6, Math.min(100, 100 - summary.latencyMs / 4))
        : 0,
      tone: summary && summary.latencyMs > 220 ? 'warn' : 'ok',
      icon: <Gauge size={12} />,
    },
    {
      label: 'Error Rate',
      value: summary ? `${summary.errorRatePct.toFixed(2)}` : '—',
      unit: '%',
      caption: 'Gateway error pressure in active window',
      score: summary
        ? Math.max(6, Math.min(100, 100 - summary.errorRatePct * 12))
        : 0,
      tone:
        summary && summary.errorRatePct > 1
          ? 'danger'
          : summary && summary.errorRatePct > 0.3
            ? 'warn'
            : 'ok',
      icon: <AlertTriangle size={12} />,
    },
    {
      label: 'Throughput',
      value: summary ? `${summary.requestsPerMin}` : '—',
      unit: 'rpm',
      caption: 'Requests served per minute',
      score: summary
        ? Math.max(6, Math.min(100, summary.requestsPerMin / 18))
        : 0,
      tone: 'ok',
      icon: <TrendingUp size={12} />,
    },
    {
      label: 'Event Intake',
      value: ingest ? `${ingest.recent_event_count}` : '—',
      unit: 'window',
      caption: 'Telemetry events in active window',
      score: ingest
        ? Math.max(6, Math.min(100, ingest.recent_event_count / 8))
        : 0,
      tone:
        ingest && ingest.error_events_last_window > 5
          ? 'warn'
          : 'ok',
      icon: <Waves size={12} />,
    },
  ] as const

  return (
    <section ref={ref} className="relative z-10">
      <div className="mx-auto max-w-[1300px] px-4 sm:px-7 md:px-10 lg:px-16 xl:px-20">
        <motion.div
          {...fadeUp(0)}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-3 flex items-baseline justify-between gap-4"
        >
          <span className="eyebrow">Performance Signals</span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-dim">
            15s refresh · live
          </span>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <motion.div
              key={it.label}
              {...fadeUp(0.06 + i * 0.05)}
              animate={inView ? { opacity: 1, y: 0 } : {}}
            >
              <KpiCard {...it} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function KpiCard({
  label,
  value,
  unit,
  caption,
  score,
  tone,
  icon,
}: {
  label: string
  value: string
  unit: string
  caption: string
  score: number
  tone: 'ok' | 'warn' | 'danger'
  icon: React.ReactNode
}) {
  const barFill =
    tone === 'danger'
      ? 'linear-gradient(90deg, rgba(255,95,95,0.45), rgba(255,95,95,0.95))'
      : tone === 'warn'
        ? 'linear-gradient(90deg, rgba(255,170,51,0.45), rgba(255,203,71,0.95))'
        : 'linear-gradient(90deg, rgba(0,229,184,0.45), rgba(0,229,184,0.95))'

  const tonePill =
    tone === 'danger'
      ? 'border-danger/40 bg-danger/[0.08] text-danger'
      : tone === 'warn'
        ? 'border-warn/40 bg-warn/[0.08] text-warn'
        : 'border-ok/40 bg-ok/[0.08] text-ok'

  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-accent-dim bg-card backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-[0_20px_56px_rgba(0,0,0,0.5)]"
      style={{
        background: 'rgba(10,20,42,0.88)',
        boxShadow:
          '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div
        className="h-[2px] w-full flex-shrink-0 rounded-t-2xl"
        style={{
          background:
            'linear-gradient(90deg, rgba(0,229,184,0.45), rgba(0,229,184,0.04))',
        }}
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-dim">
            {icon}
            {label}
          </p>
          <span
            className={cn(
              'status-badge px-2 py-0.5 text-[0.55rem]',
              tonePill,
            )}
          >
            {Math.round(score)}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-display font-light leading-none text-[#dde4f0]"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 2.1rem)' }}
          >
            {value}
          </span>
          <span className="font-mono text-[0.7rem] text-dim">{unit}</span>
        </div>

        <div className="mt-4 h-[5px] w-full overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.max(6, Math.min(100, score))}%`,
              background: barFill,
            }}
          />
        </div>

        <p className="mt-3 text-[0.78rem] font-light leading-[1.6] text-dim">
          {caption}
        </p>
      </div>
    </div>
  )
}

/* ─── Risk + Telemetry Intake (2-col) ─────────────────────────────── */
function RiskAndIntake({
  summary,
  ingest,
  totalIncidents,
  degradedEndpoints,
}: {
  summary: SummaryData | undefined
  ingest: IngestData | undefined
  totalIncidents: number
  degradedEndpoints: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="relative z-10">
      <div className="mx-auto max-w-[1300px] px-4 pt-10 sm:px-7 md:px-10 lg:px-16 xl:px-20">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Service Risk Snapshot */}
          <motion.article
            {...fadeUp(0)}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="relative overflow-hidden rounded-2xl border border-accent-dim p-6 md:p-7"
            style={{
              background: 'rgba(10,20,42,0.88)',
              boxShadow:
                '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div
              className="absolute right-0 top-0 h-[2px] w-full"
              style={{
                background:
                  'linear-gradient(90deg, rgba(0,229,184,0.45), rgba(0,229,184,0.04))',
              }}
            />
            <span className="eyebrow mb-2">Service Risk Snapshot</span>
            <h2
              className="mb-4 font-display font-light leading-[1.1] tracking-[-0.02em] text-[#dde4f0]"
              style={{ fontSize: 'clamp(1.15rem, 2.6vw, 1.55rem)' }}
            >
              Reliability <em className="title-accent">at a glance</em>
            </h2>

            <div className="mb-5 flex flex-wrap gap-2">
              <span className={cn('status-badge', healthTint(summary?.health ?? 'healthy'))}>
                <ShieldCheck size={10} />
                {summary?.health ?? 'healthy'}
              </span>
              <span className="status-badge border-ok/40 bg-ok/[0.08] text-ok">
                {summary ? `${summary.uptimePct.toFixed(2)}% uptime` : 'uptime —'}
              </span>
              <span
                className={cn(
                  'status-badge',
                  totalIncidents > 0
                    ? 'border-warn/40 bg-warn/[0.08] text-warn'
                    : 'border-accent/30 bg-accent/[0.06] text-accent',
                )}
              >
                {totalIncidents} incident signal{totalIncidents === 1 ? '' : 's'}
              </span>
              <span
                className={cn(
                  'status-badge',
                  degradedEndpoints > 0
                    ? 'border-danger/40 bg-danger/[0.08] text-danger'
                    : 'border-accent/30 bg-accent/[0.06] text-accent',
                )}
              >
                {degradedEndpoints} degraded route{degradedEndpoints === 1 ? '' : 's'}
              </span>
            </div>

            <div className="space-y-2">
              <KvRow label="Service ID" value={summary?.serviceId ?? 'api-gateway-observability'} mono />
              <KvRow
                label="P95 Latency"
                value={summary ? `${summary.latencyMs} ms` : '—'}
              />
              <KvRow
                label="Error Rate"
                value={summary ? `${summary.errorRatePct.toFixed(2)}%` : '—'}
              />
              <KvRow
                label="Requests / min"
                value={summary ? summary.requestsPerMin.toString() : '—'}
              />
            </div>

            {summary?.notes && (
              <p className="mt-5 border-t border-accent-dim pt-4 text-[0.8rem] font-light leading-[1.65] text-dim">
                {summary.notes}
              </p>
            )}
          </motion.article>

          {/* Telemetry Intake — scanlines surface */}
          <motion.article
            {...fadeUp(0.08)}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="relative overflow-hidden rounded-2xl border border-accent-dim scanlines"
            style={{ background: 'rgba(10,20,42,0.88)' }}
          >
            <div className="relative z-10 p-6 md:p-7">
              <span className="eyebrow mb-2">Telemetry Intake</span>
              <h2
                className="mb-5 font-display font-light leading-[1.1] tracking-[-0.02em] text-[#dde4f0]"
                style={{ fontSize: 'clamp(1.15rem, 2.6vw, 1.55rem)' }}
              >
                Signal <em className="title-accent">flow</em>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <Stat
                  label="Total events"
                  value={ingest ? ingest.total_events.toLocaleString() : '—'}
                />
                <Stat
                  label="Recent window"
                  value={ingest ? ingest.recent_event_count.toString() : '—'}
                />
                <Stat
                  label="Errors / window"
                  value={
                    ingest ? ingest.error_events_last_window.toString() : '—'
                  }
                  warn={!!ingest && ingest.error_events_last_window > 0}
                />
                <Stat
                  label="Last event"
                  value={
                    ingest?.last_event_at
                      ? new Date(ingest.last_event_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : '—'
                  }
                  mono
                />
              </div>

              <p className="mt-5 border-t border-accent-dim pt-4 text-[0.78rem] font-light leading-[1.65] text-dim">
                Ingestion stream feeds the gateway summary, incident detector
                and timeline. Continuous flow indicates healthy operator
                visibility.
              </p>
            </div>

            <div
              className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(0,229,184,0.08) 0%, transparent 70%)',
              }}
            />
          </motion.article>
        </div>
      </div>
    </section>
  )
}

/* ─── Incidents + Fix-First Queue ──────────────────────────────────── */
function IncidentAndFixFirst({
  incidents,
  actions,
}: {
  incidents: Incident[]
  actions: Action[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="relative z-10">
      <div className="mx-auto max-w-[1300px] px-4 pt-10 sm:px-7 md:px-10 lg:px-16 xl:px-20">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <motion.article
            {...fadeUp(0)}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="overflow-hidden rounded-2xl border border-accent-dim"
            style={{
              background: 'rgba(10,20,42,0.88)',
              boxShadow:
                '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div
              className="h-[2px] w-full"
              style={{
                background:
                  'linear-gradient(90deg, rgba(255,95,95,0.45), rgba(255,170,51,0.04))',
              }}
            />
            <div className="p-6 md:p-7">
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <span className="eyebrow">Incident Intelligence</span>
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-dim">
                  {incidents.length} active
                </span>
              </div>
              <h2
                className="mb-5 font-display font-light leading-[1.1] tracking-[-0.02em] text-[#dde4f0]"
                style={{ fontSize: 'clamp(1.15rem, 2.6vw, 1.55rem)' }}
              >
                What&apos;s under <em className="title-accent">pressure</em>
              </h2>

              {incidents.length === 0 ? (
                <EmptyRow message="No active incidents detected." />
              ) : (
                <ul className="divide-y divide-accent-dim">
                  {incidents.map((inc) => (
                    <li key={inc.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-display text-[0.95rem] font-semibold text-[#dde4f0]">
                            {inc.title}
                          </p>
                          <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-dim">
                            {inc.route ?? 'route —'} · loss/hr ${inc.estimated_loss_per_hour_usd.toFixed(2)} · traffic {inc.affected_traffic_pct.toFixed(1)}%
                          </p>
                        </div>
                        <span className={cn('status-badge', severityTint(inc.severity))}>
                          {inc.severity}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.article>

          <motion.article
            {...fadeUp(0.08)}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="overflow-hidden rounded-2xl border border-accent-dim"
            style={{
              background: 'rgba(10,20,42,0.88)',
              boxShadow:
                '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div
              className="h-[2px] w-full"
              style={{
                background:
                  'linear-gradient(90deg, rgba(255,203,71,0.45), rgba(255,203,71,0.04))',
              }}
            />
            <div className="p-6 md:p-7">
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <span className="eyebrow">Fix-First Queue</span>
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-dim">
                  ranked
                </span>
              </div>
              <h2
                className="mb-5 font-display font-light leading-[1.1] tracking-[-0.02em] text-[#dde4f0]"
                style={{ fontSize: 'clamp(1.15rem, 2.6vw, 1.55rem)' }}
              >
                Highest <em className="title-accent">impact</em> first
              </h2>

              {actions.length === 0 ? (
                <EmptyRow message="No prioritized actions yet." />
              ) : (
                <ol className="space-y-3">
                  {actions.map((a) => (
                    <li
                      key={`${a.rank}-${a.title}`}
                      className="flex items-start gap-3 rounded-xl border border-accent-dim/70 bg-white/[0.018] p-3.5 transition-colors hover:border-accent/30 hover:bg-accent/[0.025]"
                    >
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-accent/25 bg-accent/[0.07] font-mono text-[0.7rem] text-accent">
                        {a.rank}
                      </span>
                      <div className="min-w-0">
                        <p className="font-display text-[0.92rem] font-semibold leading-tight text-[#dde4f0]">
                          {a.title}
                        </p>
                        <p className="mt-1 text-[0.78rem] font-light leading-[1.6] text-dim">
                          {a.rationale}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  )
}

/* ─── Endpoint Health + Live Timeline ─────────────────────────────── */
function EndpointAndTimeline({
  endpoints,
  timeline,
}: {
  endpoints: Endpoint[]
  timeline: TimelineEvent[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const maxRequests =
    endpoints.length > 0
      ? Math.max(1, ...endpoints.map((e) => e.request_count))
      : 1

  return (
    <section ref={ref} className="relative z-10">
      <div className="mx-auto max-w-[1300px] px-4 pt-10 sm:px-7 md:px-10 lg:px-16 xl:px-20">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.article
            {...fadeUp(0)}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="overflow-hidden rounded-2xl border border-accent-dim"
            style={{
              background: 'rgba(10,20,42,0.88)',
              boxShadow:
                '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div
              className="h-[2px] w-full"
              style={{
                background:
                  'linear-gradient(90deg, rgba(0,229,184,0.45), rgba(139,127,255,0.04))',
              }}
            />
            <div className="p-6 md:p-7">
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <span className="eyebrow">Endpoint Health</span>
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-dim">
                  top routes · live
                </span>
              </div>
              <h2
                className="mb-5 font-display font-light leading-[1.1] tracking-[-0.02em] text-[#dde4f0]"
                style={{ fontSize: 'clamp(1.15rem, 2.6vw, 1.55rem)' }}
              >
                Routes by <em className="title-accent">load &amp; health</em>
              </h2>

              {endpoints.length === 0 ? (
                <EmptyRow message="No endpoint rollups available yet." />
              ) : (
                <ul className="space-y-3">
                  {endpoints.map((ep) => {
                    const loadPct = Math.max(
                      6,
                      Math.min(100, (ep.request_count / maxRequests) * 100),
                    )
                    return (
                      <li
                        key={ep.route}
                        className="rounded-xl border border-accent-dim/70 bg-white/[0.018] p-3.5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate font-mono text-[0.78rem] text-[#dde4f0]">
                            {ep.route}
                          </p>
                          <span className={cn('status-badge', healthTint(ep.health))}>
                            {ep.health}
                          </span>
                        </div>

                        <div className="mt-2.5 h-[4px] w-full overflow-hidden rounded-full bg-white/[0.05]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${loadPct}%`,
                              background:
                                ep.health === 'healthy'
                                  ? 'linear-gradient(90deg, rgba(0,229,184,0.45), rgba(0,229,184,0.95))'
                                  : ep.health === 'degraded'
                                    ? 'linear-gradient(90deg, rgba(255,170,51,0.45), rgba(255,203,71,0.95))'
                                    : 'linear-gradient(90deg, rgba(255,95,95,0.45), rgba(255,95,95,0.95))',
                            }}
                          />
                        </div>

                        <p className="mt-2 font-mono text-[0.66rem] uppercase tracking-[0.08em] text-dim">
                          req {ep.request_count.toLocaleString()} · err {ep.error_count} · p95 {ep.p95_latency_ms.toFixed(1)} ms
                        </p>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </motion.article>

          <motion.article
            {...fadeUp(0.08)}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="overflow-hidden rounded-2xl border border-accent-dim"
            style={{
              background: 'rgba(10,20,42,0.88)',
              boxShadow:
                '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div
              className="h-[2px] w-full"
              style={{
                background:
                  'linear-gradient(90deg, rgba(139,127,255,0.45), rgba(0,229,184,0.04))',
              }}
            />
            <div className="p-6 md:p-7">
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <span className="eyebrow">Live Event Feed</span>
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-dim">
                  newest first
                </span>
              </div>
              <h2
                className="mb-5 font-display font-light leading-[1.1] tracking-[-0.02em] text-[#dde4f0]"
                style={{ fontSize: 'clamp(1.15rem, 2.6vw, 1.55rem)' }}
              >
                Telemetry <em className="title-accent">timeline</em>
              </h2>

              {timeline.length === 0 ? (
                <EmptyRow message="No timeline events yet." />
              ) : (
                <ul className="relative space-y-4 border-l border-accent-dim pl-4">
                  {timeline.map((ev, idx) => {
                    const k = ev.kind.toLowerCase()
                    const dotColor =
                      k.includes('error') || k.includes('down')
                        ? 'bg-danger'
                        : k.includes('warn') || k.includes('degrad')
                          ? 'bg-warn'
                          : k.includes('info') || k.includes('ok')
                            ? 'bg-accent'
                            : 'bg-purple'
                    return (
                      <li key={`${ev.ts}-${idx}`} className="relative">
                        <span
                          className={cn(
                            'absolute -left-[20px] top-1.5 h-2 w-2 rounded-full ring-2 ring-bg',
                            dotColor,
                          )}
                        />
                        <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-dim">
                          {new Date(ev.ts).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}{' '}
                          · {ev.kind}
                        </p>
                        <p className="mt-1 text-[0.83rem] font-light leading-[1.55] text-[#dde4f0]">
                          {ev.message}
                        </p>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  )
}

/* ─── Operational Readiness footer card ───────────────────────────── */
function ReadinessFooter({
  summary,
  ingest,
  totalIncidents,
  degradedEndpoints,
}: {
  summary: SummaryData | undefined
  ingest: IngestData | undefined
  totalIncidents: number
  degradedEndpoints: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const items = [
    {
      icon: <ShieldCheck size={14} />,
      title: 'Service Posture',
      value: summary?.health ?? 'healthy',
      tone: healthTint(summary?.health ?? 'healthy'),
    },
    {
      icon: <TrendingUp size={14} />,
      title: 'Throughput',
      value: summary ? `${summary.requestsPerMin} rpm` : '—',
      tone: 'border-accent/30 bg-accent/[0.06] text-accent',
    },
    {
      icon: <Network size={14} />,
      title: 'Routes Degraded',
      value:
        degradedEndpoints > 0 ? `${degradedEndpoints} active` : 'none',
      tone:
        degradedEndpoints > 0
          ? 'border-danger/40 bg-danger/[0.08] text-danger'
          : 'border-ok/40 bg-ok/[0.08] text-ok',
    },
    {
      icon: <Bell size={14} />,
      title: 'Open Alerts',
      value: totalIncidents > 0 ? `${totalIncidents} open` : 'none',
      tone:
        totalIncidents > 0
          ? 'border-warn/40 bg-warn/[0.08] text-warn'
          : 'border-ok/40 bg-ok/[0.08] text-ok',
    },
    {
      icon: <Waves size={14} />,
      title: 'Ingestion',
      value: ingest ? `${ingest.recent_event_count} in window` : '—',
      tone: 'border-accent/30 bg-accent/[0.06] text-accent',
    },
  ]

  return (
    <section ref={ref} className="relative z-10">
      <div className="mx-auto max-w-[1300px] px-4 pb-16 pt-10 sm:px-7 md:px-10 lg:px-16 xl:px-20">
        <motion.article
          {...fadeUp(0)}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="overflow-hidden rounded-2xl border border-accent-dim"
          style={{
            background: 'rgba(10,20,42,0.88)',
            boxShadow:
              '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div
            className="h-[2px] w-full"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,229,184,0.45), rgba(255,203,71,0.04))',
            }}
          />
          <div className="p-6 md:p-7">
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <span className="eyebrow">Operational Readiness</span>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-dim">
                decision signals
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {items.map((it) => (
                <div
                  key={it.title}
                  className="rounded-xl border border-accent-dim/70 bg-white/[0.018] p-4"
                >
                  <div className="mb-2 inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-dim">
                    {it.icon}
                    {it.title}
                  </div>
                  <span
                    className={cn(
                      'status-badge',
                      it.tone,
                    )}
                  >
                    {it.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  )
}

/* ───────────────────────────────────────────────────────────────────
   Small primitives
   ─────────────────────────────────────────────────────────────────── */
function KvRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-accent-dim/70 pb-2 last:border-b-0 last:pb-0">
      <span className="font-mono text-[0.66rem] uppercase tracking-[0.1em] text-dim">
        {label}
      </span>
      <span
        className={cn(
          'text-[0.86rem] font-medium text-[#dde4f0]',
          mono && 'font-mono text-[0.78rem]',
        )}
      >
        {value}
      </span>
    </div>
  )
}

function Stat({
  label,
  value,
  warn,
  mono,
}: {
  label: string
  value: string
  warn?: boolean
  mono?: boolean
}) {
  return (
    <div className="rounded-xl border border-accent-dim/70 bg-white/[0.018] p-3.5">
      <p className="mb-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-dim">
        {label}
      </p>
      <p
        className={cn(
          'font-display font-light leading-none',
          warn ? 'text-warn' : 'text-[#dde4f0]',
          mono && 'font-mono',
        )}
        style={{ fontSize: mono ? '0.95rem' : 'clamp(1.05rem, 2.4vw, 1.4rem)' }}
      >
        {value}
      </p>
    </div>
  )
}

function EmptyRow({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-accent-dim/70 bg-white/[0.012] p-5 text-center">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-dim">
        {message}
      </p>
    </div>
  )
}
