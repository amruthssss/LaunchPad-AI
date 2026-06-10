import { useMemo } from 'react'

import { Background, Controls, MiniMap, ReactFlow } from 'reactflow'

import 'reactflow/dist/style.css'

import useStartupStore from '../store/startupStore'

const nodeLabels = {
  market_research: 'Market Research',
  business_planner: 'Business Planning',
  technical_architect: 'Technical Architecture',
  code_generator: 'Code Generation',
  forecasting: 'Forecasting',
  knowledge: 'Knowledge Base',
  deployment: 'Deployment',
  critic_after_market_research: 'Critic Review',
  critic_after_business_planner: 'Critic Review',
  critic_after_technical_architect: 'Critic Review',
}

const workflowNodes = [
  { id: 'market_research', x: 0, y: 110 },
  { id: 'critic_after_market_research', x: 210, y: 40 },
  { id: 'business_planner', x: 390, y: 110 },
  { id: 'critic_after_business_planner', x: 600, y: 40 },
  { id: 'technical_architect', x: 780, y: 110 },
  { id: 'critic_after_technical_architect', x: 990, y: 40 },
  { id: 'code_generator', x: 1170, y: 110 },
  { id: 'code_sandbox', x: 1390, y: 110 },
  { id: 'forecasting', x: 1610, y: 110 },
  { id: 'knowledge', x: 1830, y: 110 },
  { id: 'deployment', x: 2050, y: 110 },
]

const edges = [
  { id: 'e1', source: 'market_research', target: 'critic_after_market_research', type: 'smoothstep' },
  { id: 'e2', source: 'critic_after_market_research', target: 'business_planner', type: 'smoothstep' },
  { id: 'e3', source: 'business_planner', target: 'critic_after_business_planner', type: 'smoothstep' },
  { id: 'e4', source: 'critic_after_business_planner', target: 'technical_architect', type: 'smoothstep' },
  { id: 'e5', source: 'technical_architect', target: 'critic_after_technical_architect', type: 'smoothstep' },
  { id: 'e6', source: 'critic_after_technical_architect', target: 'code_generator', type: 'smoothstep' },
  { id: 'e7', source: 'code_generator', target: 'code_sandbox', type: 'smoothstep' },
  { id: 'e8', source: 'code_sandbox', target: 'forecasting', type: 'smoothstep' },
  { id: 'e9', source: 'forecasting', target: 'knowledge', type: 'smoothstep' },
  { id: 'e10', source: 'knowledge', target: 'deployment', type: 'smoothstep' },
]

function getStatusColor(status) {
  if (status === 'running') return '#38bdf8'
  if (status === 'done') return '#22c55e'
  if (status === 'failed') return '#f43f5e'
  return '#64748b'
}

export default function AgentGraphView() {
  const stepStatus = useStartupStore((state) => state.stepStatus)

  const nodes = useMemo(
    () =>
      workflowNodes.map((node) => ({
        id: node.id,
        position: { x: node.x, y: node.y },
        data: { label: nodeLabels[node.id] || node.id },
        style: {
          background: getStatusColor(stepStatus[node.id] || 'pending'),
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: '16px',
          padding: '12px 16px',
          fontSize: '12px',
          minWidth: '150px',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.35)',
        },
      })),
    [stepStatus],
  )

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Agent Graph</h2>
        <span className="text-xs uppercase tracking-[0.35em] text-slate-400">LangGraph</span>
      </div>
      <p className="mt-2 text-sm text-slate-300">Live workflow graph with critic branches and sandbox step.</p>

      <div className="mt-4 h-[420px] rounded-2xl border border-white/10 bg-slate-950/80">
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background color="#475569" gap={18} />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </section>
  )
}
