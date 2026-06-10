import { useEffect, useMemo, useRef } from 'react'

import mermaid from 'mermaid'

import useStartupStore from '../store/startupStore'

mermaid.initialize({ startOnLoad: false, theme: 'dark' })

export default function ArchitectureCard() {
  const techArchitecture = useStartupStore((state) => state.allOutputs.tech_architecture || {})
  const diagramRef = useRef(null)
  const rows = useMemo(() => {
    const entries = [
      ['Frontend', techArchitecture.frontend],
      ['Backend', techArchitecture.backend],
      ['Database', techArchitecture.database],
      ['Deployment', techArchitecture.deployment],
    ]

    return entries.filter((entry) => entry[1])
  }, [techArchitecture])

  useEffect(() => {
    const renderDiagram = async () => {
      if (!diagramRef.current || !techArchitecture.mermaid_diagram) return
      try {
        const { svg } = await mermaid.render(`mermaid-${Date.now()}`, techArchitecture.mermaid_diagram)
        diagramRef.current.innerHTML = svg
      } catch {
        diagramRef.current.innerHTML = '<p class="text-sm text-slate-400">Mermaid diagram unavailable</p>'
      }
    }

    renderDiagram()
  }, [techArchitecture.mermaid_diagram])

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
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Mermaid Diagram</h3>
        <div ref={diagramRef} className="overflow-x-auto text-slate-100" />
      </div>
    </section>
  )
}
