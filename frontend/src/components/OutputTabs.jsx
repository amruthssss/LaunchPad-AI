import { useMemo, useState } from 'react'

import AutomationPanel from './AutomationPanel'
import ArchitectureCard from './ArchitectureCard'
import BusinessPlanCard from './BusinessPlanCard'
import CodeViewer from './CodeViewer'
import ForecastChart from './ForecastChart'
import MarketResearchCard from './MarketResearchCard'
import ValidationScore from './ValidationScore'
import useStartupStore from '../store/startupStore'

const agentTabs = [
  { key: 'market_research', label: 'Market Research', component: MarketResearchCard },
  { key: 'business_planner', label: 'Business Plan', component: BusinessPlanCard },
  { key: 'technical_architect', label: 'Architecture', component: ArchitectureCard },
  { key: 'code_generator', label: 'Code', component: () => <CodeViewer sourceKey="fastapi_backend" /> },
  { key: 'forecasting', label: 'Forecast', component: ForecastChart },
  { key: 'deployment', label: 'Deployment', component: () => <CodeViewer sourceKey="fastapi_backend" /> },
]

export default function OutputTabs() {
  const stepStatus = useStartupStore((state) => state.stepStatus)
  const outputs = useStartupStore((state) => state.allOutputs)
  const [activeTab, setActiveTab] = useState(null)

  const completedTabs = useMemo(() => agentTabs.filter((tab) => stepStatus[tab.key] === 'done'), [stepStatus])

  const active = activeTab || completedTabs[0]?.key || 'market_research'
  const activeDefinition = completedTabs.find((tab) => tab.key === active) || completedTabs[0]
  const ActiveComponent = activeDefinition?.component || MarketResearchCard

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">Outputs</h2>
        {outputs.business_plan?.validation_score ? <ValidationScore score={outputs.business_plan.validation_score} /> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {completedTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${active === tab.key ? 'bg-cyan-400 text-slate-950' : 'bg-white/10 text-slate-100 hover:bg-white/15'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {activeDefinition ? <ActiveComponent /> : <p className="text-sm text-slate-400">Waiting for completed agent output...</p>}
      </div>

      <div className="mt-5">
        <AutomationPanel />
      </div>
    </section>
  )
}
