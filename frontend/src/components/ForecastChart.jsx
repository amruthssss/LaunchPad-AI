import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import useStartupStore from '../store/startupStore'

export default function ForecastChart() {
  const forecast = useStartupStore((state) => state.allOutputs.forecast || {})
  const revenueForecast = forecast.revenue_forecast || []

  const data = revenueForecast.map((item, index) => ({
    month: item.month ?? index + 1,
    revenue: item.value ?? 0,
  }))
  const lastRevenue = data.at(-1)?.revenue ?? 0
  const firstRevenue = data[0]?.revenue ?? 0
  const annualizedGrowth = firstRevenue ? Math.round(((lastRevenue / firstRevenue) ** (1 / Math.max(data.length - 1, 1)) - 1) * 100) : 0

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-white">Revenue outlook</h2><p className="mt-1 text-sm text-slate-400">A directional first-year model in monthly recurring revenue.</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-wider text-slate-400">Illustrative</span></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">Month 1 MRR</p><p className="mt-2 text-xl font-semibold text-white">${firstRevenue.toLocaleString()}</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">Month 12 MRR</p><p className="mt-2 text-xl font-semibold text-cyan-300">${lastRevenue.toLocaleString()}</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">Monthly growth assumption</p><p className="mt-2 text-xl font-semibold text-white">{annualizedGrowth}%</p></div></div>
      <div className="mt-4 h-80 rounded-2xl border border-white/10 bg-white/5 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)' }} />
            <Line type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
