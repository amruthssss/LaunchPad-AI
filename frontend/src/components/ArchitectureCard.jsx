import { useMemo } from 'react'

import useStartupStore from '../store/startupStore'

export default function ArchitectureCard() {
  const techArchitecture = useStartupStore((state) => state.allOutputs.tech_architecture || {})
  const rows = useMemo(() => {
    const entries = [
      ['Frontend', techArchitecture.frontend],
      ['Backend', techArchitecture.backend],
      ['Database', techArchitecture.database],
      ['Deployment', techArchitecture.deployment],
    ]

    return entries.filter((entry) => entry[1])
  }, [techArchitecture])

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <h2 className="text-lg font-semibold text-white">Architecture</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Layer</th>
              <th className="px-4 py-3 font-medium">Technology</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([layer, technology]) => (
              <tr key={layer} className="border-t border-white/8">
                <td className="px-4 py-3">{layer}</td>
                <td className="px-4 py-3">{technology}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">How the pieces connect</h3>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
          {[
            ['01', 'Experience', techArchitecture.frontend || 'Product interface'],
            ['02', 'Intelligence', `${techArchitecture.backend || 'API'} · ${techArchitecture.orchestration || 'Workflow'}`],
            ['03', 'Foundation', techArchitecture.database || 'Persistent data'],
          ].map(([number, title, detail], index) => (
            <div key={number} className="contents">
              <div className="min-w-0 rounded-xl border border-white/10 bg-slate-950/60 p-3 transition hover:border-cyan-300/35">
                <span className="text-[9px] font-semibold tracking-widest text-cyan-300">{number}</span>
                <h4 className="mt-2 text-xs font-semibold text-white">{title}</h4>
                <p className="mt-1 text-[10px] leading-5 text-slate-400">{detail}</p>
              </div>
              {index < 2 ? <span className="hidden text-center text-cyan-300 sm:block">→</span> : null}
            </div>
          ))}
        </div>
        {techArchitecture.summary ? <p className="mt-3 text-xs leading-5 text-slate-400">{techArchitecture.summary}</p> : null}
      </div>
    </section>
  )
}
