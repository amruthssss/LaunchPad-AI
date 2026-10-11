import { useState } from 'react'

import useStartupStore from '../store/startupStore'

const actions = [
  { key: 'github', label: 'Create GitHub repository', endpoint: '/api/automation/github' },
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
      const idea = JSON.parse(sessionStorage.getItem(`startup:${sessionId}`) || '{}').idea || 'LaunchPad startup plan'
      const recipient = action.key === 'email' ? window.prompt('Email address for the report:') : null
      if (action.key === 'email' && !recipient) return
      const payload = action.key === 'github'
        ? { name: idea.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || 'launchpad-startup' }
        : action.key === 'notion'
          ? { title: `${idea} — LaunchPad plan` }
          : action.key === 'email'
            ? { recipient, subject: `Launch plan: ${idea}`, body: `Your LaunchPad AI workspace is ready.\n\nIdea: ${idea}\nSession: ${sessionId}\n\nOpen the project dashboard to review your market research, business plan, product architecture, and forecast.` }
            : { channel: '#general', text: `Launch plan ready: ${idea}\nSession: ${sessionId}` }
      const response = await fetch(action.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      if (!response.ok || result.status === 'error') throw new Error(result.message || `Request failed with status ${response.status}`)
      setToast({ type: result.status === 'completed' ? 'success' : 'error', message: result.message || result.url || (result.status === 'not_configured' ? 'Add the integration credentials to your .env file first.' : `${action.label} complete.`) })
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
