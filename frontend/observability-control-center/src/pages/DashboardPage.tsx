import { LatencyChart } from '../components/dashboard/LatencyChart'
import { LiveStreamPanel } from '../components/dashboard/LiveStreamPanel'
import { RouteTable } from '../components/dashboard/RouteTable'
import { ThroughputChart } from '../components/dashboard/ThroughputChart'
import { TopMetricsBar } from '../components/dashboard/TopMetricsBar'
import { AppFrame } from '../components/layout/AppFrame'
import { useAppState } from '../hooks/useAppState'

export const DashboardPage = () => {
  const { metrics, loading, error } = useAppState()
  const isInitialLoading = loading && !metrics

  return (
    <AppFrame>
      <section className="page-header panel">
        <h2>Traffic Intelligence Dashboard</h2>
        <p>Monitoring `/metrics` every 3 seconds. Last 60 points retained.</p>
      </section>

      <section className="status-strip panel" aria-live="polite">
        <span className={isInitialLoading ? 'text-warning' : 'text-ok'}>
          {isInitialLoading ? 'Loading metrics feed...' : 'Live metrics feed active'}
        </span>
        <span className="status-meta">Refresh cadence: 3s</span>
      </section>

      {error && <div className="panel text-critical status-error">{error}</div>}
      {!metrics ? null : (
        <div className="dashboard-layout">
          <div className="dashboard-main">
            <TopMetricsBar summary={metrics.summary} />
            <div className="charts-grid">
              <ThroughputChart points={metrics.timeseries.rps} />
              <LatencyChart points={metrics.timeseries.latency} />
            </div>
            <RouteTable routes={metrics.routes} />
          </div>
          <LiveStreamPanel routes={metrics.routes} />
        </div>
      )}
    </AppFrame>
  )
}
