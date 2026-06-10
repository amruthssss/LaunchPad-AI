import useStartupStore from '../store/startupStore'

export default function MarketResearchCard() {
  const marketResearch = useStartupStore((state) => state.allOutputs.market_research || {})

  const competitors = marketResearch.competitors || []
  const trends = marketResearch.trends || []
  const problems = marketResearch.customer_problems || []
  const marketSize = marketResearch.market_size || '0'

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <h2 className="text-lg font-semibold text-white">Market Research</h2>
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Market Size</p>
        <p className="mt-2 text-4xl font-semibold text-cyan-300">{marketSize}</p>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Competitors</h3>
        <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
              </tr>
            </thead>
            <tbody>
              {competitors.length > 0 ? competitors.map((competitor) => (
                <tr key={competitor} className="border-t border-white/8">
                  <td className="px-4 py-3">{competitor}</td>
                </tr>
              )) : (
                <tr>
                  <td className="px-4 py-3 text-slate-400">No competitor data yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Trends</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {trends.length > 0 ? trends.map((trend) => (
            <span key={trend} className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs text-cyan-200">
              {trend}
            </span>
          )) : (
            <span className="text-sm text-slate-400">No trends yet</span>
          )}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Customer Problems</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
          {problems.length > 0 ? problems.map((problem) => <li key={problem}>{problem}</li>) : <li>No problems yet</li>}
        </ul>
      </div>
    </section>
  )
}
