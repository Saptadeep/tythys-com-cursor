import { useMemo, useState } from 'react'
import clsx from 'clsx'
import type { RouteMetric } from '../../types/metrics'

type SortKey = 'path' | 'hits' | 'error_rate' | 'avg_latency'

interface RouteTableProps {
  routes: RouteMetric[]
}

export const RouteTable = ({ routes }: RouteTableProps) => {
  const [sortBy, setSortBy] = useState<SortKey>('hits')
  const [ascending, setAscending] = useState(false)
  const [query, setQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState<'all' | 'critical' | 'warning'>('all')

  const filteredRows = useMemo(() => {
    return routes.filter((row) => {
      const matchesQuery = row.path.toLowerCase().includes(query.toLowerCase().trim())
      if (!matchesQuery) return false
      if (riskFilter === 'critical') return row.error_rate > 5
      if (riskFilter === 'warning') return row.avg_latency > 300
      return true
    })
  }, [routes, query, riskFilter])

  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows].sort((a, b) => {
      if (sortBy === 'path') return a.path.localeCompare(b.path)
      return a[sortBy] - b[sortBy]
    })
    return ascending ? sorted : sorted.reverse()
  }, [filteredRows, sortBy, ascending])

  const criticalCount = routes.filter((row) => row.error_rate > 5).length
  const warningCount = routes.filter((row) => row.avg_latency > 300).length

  const updateSort = (field: SortKey) => {
    if (sortBy === field) {
      setAscending((value) => !value)
      return
    }
    setSortBy(field)
    setAscending(true)
  }

  return (
    <article className="panel table-card">
      <div className="table-header">
        <h3>Route Metrics</h3>
        <div className="table-badges">
          <span className="badge">Total: {routes.length}</span>
          <span className="badge badge-critical">Critical: {criticalCount}</span>
          <span className="badge badge-warning">High latency: {warningCount}</span>
        </div>
      </div>
      <div className="table-controls">
        <input
          aria-label="Filter routes by path"
          className="table-filter-input"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by route path..."
          type="search"
          value={query}
        />
        <select
          aria-label="Filter rows by risk level"
          className="table-filter-select"
          onChange={(event) =>
            setRiskFilter(event.target.value as 'all' | 'critical' | 'warning')
          }
          value={riskFilter}
        >
          <option value="all">All rows</option>
          <option value="critical">Critical errors only</option>
          <option value="warning">High latency only</option>
        </select>
      </div>
      <div className="table-scroll-shell">
        <table>
          <thead>
            <tr>
              <th onClick={() => updateSort('path')}>Path {sortBy === 'path' ? (ascending ? '↑' : '↓') : ''}</th>
              <th onClick={() => updateSort('hits')}>Hits {sortBy === 'hits' ? (ascending ? '↑' : '↓') : ''}</th>
              <th onClick={() => updateSort('error_rate')}>
                Error Rate {sortBy === 'error_rate' ? (ascending ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => updateSort('avg_latency')}>
                Latency {sortBy === 'avg_latency' ? (ascending ? '↑' : '↓') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, index) => (
              <tr key={`${row.path}-${index}`}>
                <td>
                  <span className="truncate inline-block" title={row.path}>
                    {row.path}
                  </span>
                </td>
                <td>{row.hits.toLocaleString()}</td>
                <td className={clsx(row.error_rate > 5 && 'text-critical')}>
                  {row.error_rate.toFixed(2)}%
                </td>
                <td className={clsx(row.avg_latency > 300 && 'text-warning')}>
                  {row.avg_latency.toFixed(2)}ms
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}
