import { useState } from 'react'

import useStartupStore from '../store/startupStore'

const actions = [
  { key: 'github', label: 'Push to GitHub', endpoint: '/api/automation/github' },
  { key: 'notion', label: 'Export to Notion', endpoint: '/api/automation/notion' },
  { key: 'email', label: 'Send Email Report', endpoint: '/api/automation/email' },
  { key: 'slack', label: 'Post to Slack', endpoint: '/api/automation/slack' },
]

function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className={`mt-4 rounded-2xl px-4 py-3 text-sm ${toast.type === 'success' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-rose-500/15 text-rose-200'}`}>
      {toast.message}
    </div>
  )
}

export default function AutomationPanel() {
  const sessionId = useStartupStore((state) => state.sessionId)
  const [loadingKey, setLoadingKey] = useState(null)
  const [toast, setToast] = useState(null)

  const runAutomation = async (action) => {
    if (!sessionId) return
    setLoadingKey(action.key)
    setToast(null)

    try {
      const response = await fetch(`${action.endpoint}/${sessionId}`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      setToast({ type: 'success', message: `${action.label} completed successfully.` })
    } catch (error) {
      setToast({ type: 'error', message: error.message || `${action.label} failed.` })
    } finally {
      setLoadingKey(null)
      window.setTimeout(() => setToast(null), 3500)
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <h2 className="text-lg font-semibold text-white">Automation</h2>
      <div className="mt-4 grid gap-3">
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={() => runAutomation(action)}
            disabled={!sessionId || loadingKey === action.key}
            className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingKey === action.key ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" /> : null}
            {action.label}
          </button>
        ))}
      </div>
      <Toast toast={toast} />
    </section>
  )
}
