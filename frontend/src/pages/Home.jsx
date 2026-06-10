import { useState } from 'react'

import useStartupStore from '../store/startupStore'

const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Other']
const countries = ['USA', 'India', 'UK', 'Canada', 'Australia', 'Other']
const businessModels = ['SaaS', 'Marketplace', 'Freemium', 'Enterprise', 'D2C']

function navigateTo(pathname) {
  window.history.pushState({}, '', pathname)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export default function Home() {
  const setSessionId = useStartupStore((state) => state.setSessionId)
  const setLoading = useStartupStore((state) => state.setLoading)
  const setError = useStartupStore((state) => state.setError)
  const [form, setForm] = useState({
    idea: '',
    industry: industries[0],
    target_audience: '',
    country: countries[0],
    business_model: businessModels[0],
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/startup/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = await response.json()
      setSessionId(data.session_id)
      sessionStorage.setItem(
        `startup:${data.session_id}`,
        JSON.stringify({ ...form, session_id: data.session_id }),
      )
      navigateTo(`/dashboard/${data.session_id}`)
    } catch (error) {
      setError(error.message || 'Failed to generate startup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:p-10">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.45em] text-cyan-300">AI Startup Factory</p>
          <h1 className="mt-4 bg-gradient-to-r from-cyan-300 via-emerald-300 to-teal-200 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
            Generate your next startup in minutes
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Enter a startup idea and let the multi-agent workflow research, plan, architect, code, forecast, and deploy the foundation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Startup Idea</label>
            <textarea
              required
              value={form.idea}
              onChange={(event) => setForm((current) => ({ ...current, idea: event.target.value }))}
              placeholder="e.g. AI Resume Builder"
              className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Industry</label>
              <select
                value={form.industry}
                onChange={(event) => setForm((current) => ({ ...current, industry: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Target Audience</label>
              <input
                value={form.target_audience}
                onChange={(event) => setForm((current) => ({ ...current, target_audience: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                placeholder="Startup founders, doctors, students..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Country</label>
              <select
                value={form.country}
                onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Business Model</label>
              <select
                value={form.business_model}
                onChange={(event) => setForm((current) => ({ ...current, business_model: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
              >
                {businessModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-4 text-base font-semibold text-slate-950 transition hover:brightness-110"
          >
            Generate Startup
          </button>
        </form>
      </section>
    </main>
  )
}