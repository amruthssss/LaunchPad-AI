import { FiDollarSign, FiTarget, FiTrendingUp, FiTool, FiZap } from 'react-icons/fi'

import useStartupStore from '../store/startupStore'

const cards = [
  { key: 'value_proposition', title: 'Value Proposition', icon: FiTarget },
  { key: 'customer_segments', title: 'Customer Segments', icon: FiTarget },
  { key: 'revenue_streams', title: 'Revenue Streams', icon: FiDollarSign },
  { key: 'cost_structure', title: 'Cost Structure', icon: FiTool },
  { key: 'key_activities', title: 'Key Activities', icon: FiZap },
]

function toList(value) {
  if (Array.isArray(value)) return value
  if (!value) return []
  return [value]
}

export default function BusinessPlanCard() {
  const businessPlan = useStartupStore((state) => state.allOutputs.business_plan || {})

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <h2 className="text-lg font-semibold text-white">Business Plan</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon
          const items = card.key === 'value_proposition' ? [businessPlan.value_proposition || 'Awaiting output'] : toList(businessPlan[card.key])

          return (
            <article key={card.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-cyan-300">
                <Icon />
                <h3 className="font-semibold text-white">{card.title}</h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {items.map((item) => (
                  <li key={item} className="rounded-lg bg-slate-900/60 px-3 py-2">{item}</li>
                ))}
              </ul>
            </article>
          )
        })}
      </div>
    </section>
  )
}
