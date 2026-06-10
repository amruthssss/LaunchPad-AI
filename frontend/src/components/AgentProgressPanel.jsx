import { FiCheck, FiX } from 'react-icons/fi'

import useStartupStore from '../store/startupStore'

const steps = [
  { key: 'market_research', label: 'Market Research' },
  { key: 'business_planner', label: 'Business Planning' },
  { key: 'technical_architect', label: 'Technical Architecture' },
  { key: 'code_generator', label: 'Code Generation' },
  { key: 'forecasting', label: 'Forecasting' },
  { key: 'knowledge', label: 'Knowledge Base' },
  { key: 'deployment', label: 'Deployment' },
  { key: 'critic_after_market_research', label: 'Critic Review' },
]

function StatusIcon({ status }) {
  if (status === 'done') return <FiCheck className="text-emerald-400" />
  if (status === 'failed') return <FiX className="text-rose-400" />
  if (status === 'running') {
    return <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
  }
  return <span className="h-4 w-4 rounded-full border border-slate-600" />
}

export default function AgentProgressPanel() {
  const stepStatus = useStartupStore((state) => state.stepStatus)

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-lg shadow-cyan-950/10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Agent Progress</h2>
          <p className="text-sm text-slate-400">Live workflow status</p>
        </div>
      </div>
      <div className="space-y-3">
        {steps.map((step) => {
          const status = stepStatus[step.key] || 'pending'
          const badgeClass =
            status === 'done'
              ? 'bg-emerald-500/15 text-emerald-300'
              : status === 'running'
                ? 'bg-cyan-500/15 text-cyan-300'
                : status === 'failed'
                  ? 'bg-rose-500/15 text-rose-300'
                  : 'bg-slate-700/50 text-slate-300'

          return (
            <div key={step.key} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <StatusIcon status={status} />
                <span className="text-sm font-medium text-white">{step.label}</span>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${badgeClass}`}>
                {status}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
