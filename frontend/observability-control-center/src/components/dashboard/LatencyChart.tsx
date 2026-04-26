import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface LatencyChartProps {
  points: number[]
}

export const LatencyChart = ({ points }: LatencyChartProps) => {
  const data = points.map((value, index) => ({ tick: index + 1, value }))

  return (
    <article className="panel chart-card">
      <h3>Latency (ms)</h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
          <XAxis dataKey="tick" hide />
          <YAxis stroke="var(--color-muted)" width={45} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-amber)"
            fill="color-mix(in srgb, var(--color-amber) 30%, transparent)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </article>
  )
}
