import { useEffect, useState } from 'react'

function navigateTo(pathname) {
  window.history.pushState({}, '', pathname)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export default function History() {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    fetch('/api/startup/history')
      .then((response) => response.json())
      .then(setSessions)
      .catch(() => setSessions([]))
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.45em] text-cyan-300">History</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Startup Sessions</h1>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Idea</th>
                <th className="px-4 py-3 font-medium">Industry</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created At</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-t border-white/8">
                  <td className="px-4 py-3">{session.idea}</td>
                  <td className="px-4 py-3">{session.industry || '-'}</td>
                  <td className="px-4 py-3">{session.status}</td>
                  <td className="px-4 py-3">{new Date(session.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigateTo(`/dashboard/${session.id}`)}
                      className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}export default function History() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-lg font-semibold text-white">History</h2>
      <p className="mt-3 text-sm text-slate-300">
        Placeholder run history, archived evaluations, and previous startup generations.
      </p>
    </section>
  )
}
