import { useEffect, useState } from 'react'
import { FiArrowLeft, FiArrowRight, FiClock, FiZap } from 'react-icons/fi'

function navigateTo(pathname) {
  window.history.pushState({}, '', pathname)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export default function History() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/startup/history')
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.detail || 'Could not load your saved ideas.')
        return data
      })
      .then(setSessions)
      .catch((reason) => setError(reason.message || 'Could not reach the API.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl animate-in">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div><p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Your workspace</p><h1 className="mt-2 text-3xl font-semibold">Past ideas</h1><p className="mt-2 text-sm text-slate-400">Pick up where a previous launch plan left off.</p></div>
          <button onClick={() => navigateTo('/')} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm transition hover:border-cyan-300/50 hover:bg-white/10"><FiArrowLeft /> New idea</button>
        </header>
        {loading ? <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-slate-300"><span className="mr-3 inline-block h-4 w-4 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent align-middle" />Loading your ideas…</div> : null}
        {error ? <div role="alert" className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-5 text-sm text-rose-200">{error}</div> : null}
        {!loading && !error && sessions.length === 0 ? <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-14 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200"><FiZap /></span><h2 className="mt-5 text-xl font-semibold">Nothing on the launchpad yet.</h2><p className="mt-2 text-sm text-slate-400">Start with one idea. Your market notes and roadmap will be waiting here.</p><button onClick={() => navigateTo('/')} className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950">Start an idea <FiArrowRight /></button></div> : null}
        {!loading && sessions.length > 0 ? <div className="grid gap-3">{sessions.map((session, index) => <article key={session.id} className="animate-in flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/30 hover:bg-white/[0.07] sm:flex-row sm:items-center sm:justify-between" style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${session.status === 'completed' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-cyan-300/10 text-cyan-200'}`}>{session.status}</span><span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><FiClock />{new Date(session.created_at).toLocaleString()}</span></div><h2 className="mt-3 truncate text-base font-medium text-white sm:text-lg">{session.idea}</h2><p className="mt-1 text-xs text-slate-400">{session.industry || 'Startup idea'} <span className="mx-1.5 text-slate-600">·</span> Session {session.id.slice(0, 8)}</p></div><button onClick={() => navigateTo(`/dashboard/${session.id}`)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs font-medium text-white transition hover:border-cyan-300/50 hover:bg-cyan-300/10">Open launch plan <FiArrowRight /></button></article>)}</div> : null}
      </section>
    </main>
  )
}
