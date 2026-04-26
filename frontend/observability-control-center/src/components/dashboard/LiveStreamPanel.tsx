import { useMemo, useState } from 'react'
import type { RouteMetric } from '../../types/metrics'

interface LiveStreamPanelProps {
  routes: RouteMetric[]
}

const methods = ['GET', 'POST', 'PATCH', 'DELETE']
const statuses = [200, 200, 200, 201, 400, 401, 500]

export const LiveStreamPanel = ({ routes }: LiveStreamPanelProps) => {
  const [paused, setPaused] = useState(false)
  const [activeLine, setActiveLine] = useState<string>('')
  const [visibleRows, setVisibleRows] = useState<
    { line: string; critical: boolean; key: string }[]
  >([])

  const rows = useMemo(
    () =>
      routes.slice(0, 16).map((route, index) => {
        const method = methods[index % methods.length]
        const deterministicIndex =
          (index + Math.round(route.error_rate) + Math.round(route.avg_latency)) % statuses.length
        const status = statuses[deterministicIndex]
        const hour = 14
        const minute = 10 + Math.floor(index / 2)
        const second = (index * 7) % 60
        const stamp = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}:${second.toString().padStart(2, '0')}`
        const line = `[${stamp}] ${method} ${route.path} -> ${status} (${route.avg_latency.toFixed(2)}ms)`
        return {
          line,
          critical: status >= 500,
          key: `${route.path}-${index}-${status}`,
        }
      }),
    [routes],
  )

  const displayRows = paused ? visibleRows : rows
  const footerLine = activeLine || displayRows[0]?.line || ''

  const togglePause = () => {
    if (!paused) {
      setVisibleRows(rows)
    }
    setPaused((value) => !value)
  }

  return (
    <aside className="panel right-panel">
      <div className="stream-header">
        <h3>Live Request Stream</h3>
        <button className="stream-toggle-btn" onClick={togglePause} type="button">
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>
      <ul className="log-list stream-scroll-shell">
        {displayRows.map((entry) => (
          <li
            className={entry.critical ? 'text-critical stream-row' : 'stream-row'}
            key={entry.key}
            onMouseEnter={() => setActiveLine(entry.line)}
            title={entry.line}
          >
            <span className="truncate stream-line" title={entry.line}>
              {entry.line}
            </span>
          </li>
        ))}
      </ul>
      <div className="stream-footer" title={footerLine}>
        <span className="truncate">
          {footerLine || 'Hover a row to inspect the full request string'}
        </span>
      </div>
    </aside>
  )
}
