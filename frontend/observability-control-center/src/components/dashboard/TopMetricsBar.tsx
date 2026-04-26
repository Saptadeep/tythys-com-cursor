import clsx from 'clsx'
import type { MetricsSummary } from '../../types/metrics'

interface TopMetricsBarProps {
  summary: MetricsSummary
}

const tiles = (summary: MetricsSummary) => [
  { label: 'RPS', value: summary.rps.toFixed(2), tone: 'normal' },
  { label: 'Error Rate', value: `${summary.error_rate.toFixed(2)}%`, tone: summary.error_rate > 5 ? 'critical' : 'normal' },
  { label: 'P95 Latency', value: `${summary.p95_latency.toFixed(2)}ms`, tone: summary.p95_latency > 300 ? 'warning' : 'normal' },
  { label: 'Total Requests', value: summary.total_requests.toLocaleString(), tone: 'normal' },
]

export const TopMetricsBar = ({ summary }: TopMetricsBarProps) => {
  return (
    <section className="metrics-grid">
      {tiles(summary).map((tile) => (
        <article className={clsx('metric-tile panel', `tone-${tile.tone}`)} key={tile.label}>
          <p className="metric-label">{tile.label}</p>
          <p className="metric-value">{tile.value}</p>
        </article>
      ))}
    </section>
  )
}
