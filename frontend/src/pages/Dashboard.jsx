import { useEffect, useMemo } from 'react'

import AgentGraphView from '../components/AgentGraphView'
import AgentProgressPanel from '../components/AgentProgressPanel'
import AutomationPanel from '../components/AutomationPanel'
import OutputTabs from '../components/OutputTabs'
import useWebSocket from '../hooks/useWebSocket'
import useStartupStore from '../store/startupStore'

function getSessionIdFromPath() {
  const parts = window.location.pathname.split('/').filter(Boolean)
  return parts[0] === 'dashboard' ? parts[1] : null
}

export default function Dashboard() {
  const sessionId = useMemo(() => getSessionIdFromPath(), [])
  const setSessionId = useStartupStore((state) => state.setSessionId)
  const setLoading = useStartupStore((state) => state.setLoading)
  const setError = useStartupStore((state) => state.setError)
  const resetStore = useStartupStore((state) => state.resetStore)
  const isLoading = useStartupStore((state) => state.isLoading)

  const sessionState = sessionId ? JSON.parse(sessionStorage.getItem(`startup:${sessionId}`) || '{}') : {}
  const { isConnected } = useWebSocket(sessionId)

  useEffect(() => {
    if (!sessionId) return
    setSessionId(sessionId)
    setLoading(true)

    fetch(`/api/startup/${sessionId}/status`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        useStartupStore.setState({
          stepStatus: data.step_status || {},
          allOutputs: data.outputs || {},
          error: null,
        })
      })
      .catch((error) => setError(error.message || 'Failed to load startup status'))
      .finally(() => setLoading(false))
  }, [sessionId, setError, setLoading, setSessionId])

  useEffect(() => {
    return () => {
      resetStore()
    }
  }, [resetStore])

  const idea = sessionState.idea || 'Untitled Startup'

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-cyan-300">Session Dashboard</p>
              <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{idea}</h1>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
              <p className="font-semibold text-white">Session ID</p>
              <p className="break-all text-xs text-slate-400">{sessionId}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.3em] text-cyan-300">{isConnected ? 'Connected' : 'Disconnected'}</p>
              {isLoading ? <p className="mt-1 text-xs text-slate-400">Loading...</p> : null}
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[0.3fr_0.7fr]">
            <aside className="space-y-6">
              <AgentProgressPanel />
              <AgentGraphView />
              <AutomationPanel />
            </aside>

            <section>
              <OutputTabs />
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}export default function Dashboard() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-lg font-semibold text-white">Dashboard</h2>
      <p className="mt-3 text-sm text-slate-300">
        A landing surface for the startup generation workflow and its agent status.
      </p>
    </section>
  )
}
