import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface ThroughputChartProps {
  points: number[]
}

export const ThroughputChart = ({ points }: ThroughputChartProps) => {
  const data = points.map((value, index) => ({ tick: index + 1, value }))

  return (
    <article className="panel chart-card">
      <h3>Throughput (RPS)</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
          <XAxis dataKey="tick" hide />
          <YAxis stroke="var(--color-muted)" width={45} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-cyan)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </article>
  )
}
