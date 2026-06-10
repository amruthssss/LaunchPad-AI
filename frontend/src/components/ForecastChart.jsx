import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import useStartupStore from '../store/startupStore'

export default function ForecastChart() {
  const forecast = useStartupStore((state) => state.allOutputs.forecast || {})
  const revenueForecast = forecast.revenue_forecast || []
  const growthCurve = forecast.growth_curve || []

  const data = revenueForecast.map((item, index) => ({
    month: item.month ?? index + 1,
    revenue: item.value ?? 0,
    growth: growthCurve[index] ?? null,
  }))

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <h2 className="text-lg font-semibold text-white">Forecast Chart</h2>
      <div className="mt-4 h-80 rounded-2xl border border-white/10 bg-white/5 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)' }} />
            <Line type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={3} dot={false} />
            {growthCurve.length > 0 ? <Line type="monotone" dataKey="growth" stroke="#22c55e" strokeWidth={3} dot={false} /> : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
