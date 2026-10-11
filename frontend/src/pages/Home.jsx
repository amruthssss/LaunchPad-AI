import { useState } from 'react'
import { FiArrowDownRight, FiArrowRight, FiCheck, FiCommand, FiLayers, FiPlay, FiRadio, FiZap } from 'react-icons/fi'
import useStartupStore from '../store/startupStore'
import { apiUrl } from '../lib/api'

const industries = ['Technology', 'Healthcare', 'Fintech', 'Education', 'E-commerce', 'Climate', 'Other']
const models = ['SaaS', 'Marketplace', 'Freemium', 'Enterprise', 'D2C', 'Usage-based']

function navigateTo(pathname) {
  window.history.pushState({}, '', pathname)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

const work = [
  ['01', 'Find the opening', 'Map your audience, category, competition, and the problem worth solving.'],
  ['02', 'Shape the business', 'Turn the insight into a clear model, first customers, and a route to market.'],
  ['03', 'Make it tangible', 'See a technical plan, starter code, forecast, and launch checklist take shape.'],
]

export default function Home() {
  const setSessionId = useStartupStore((state) => state.setSessionId)
  const setLoading = useStartupStore((state) => state.setLoading)
  const setError = useStartupStore((state) => state.setError)
  const isLoading = useStartupStore((state) => state.isLoading)
  const error = useStartupStore((state) => state.error)
  const [form, setForm] = useState({ idea: '', industry: industries[0], target_audience: '', country: 'United States', business_model: models[0] })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(apiUrl('/api/startup/generate'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Could not start your launch plan.')
      setSessionId(data.session_id)
      sessionStorage.setItem(`startup:${data.session_id}`, JSON.stringify({ ...form, session_id: data.session_id }))
      navigateTo(`/dashboard/${data.session_id}`)
    } catch (err) {
      setError(err.message || 'Could not connect to LaunchPad AI. Make sure the API is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="site-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="/" onClick={(e) => { e.preventDefault(); navigateTo('/') }}><span className="brand-mark"><FiZap /></span><span>launchpad<span className="brand-light">.ai</span></span></a>
        <nav className="topnav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a><a href="#workflow">The workflow</a>
        </nav>
        <button className="nav-cta" onClick={() => document.getElementById('start')?.scrollIntoView({ behavior: 'smooth' })}>Try the workspace <FiArrowRight /></button>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><span className="pulse-dot" /> YOUR IDEA, WITH A HEAD START</div>
            <h1>Big ideas deserve<br />a <span className="hero-gradient">running start.</span></h1>
            <p className="hero-description">From the first spark to a market-backed launch plan. Let a team of AI agents research, map, and shape your next venture.</p>
            <div className="hero-actions"><button className="primary-button" onClick={() => document.getElementById('start')?.scrollIntoView({ behavior: 'smooth' })}>Build your launch plan <FiArrowRight /></button><a className="text-link" href="#how-it-works">See how it works <FiArrowDownRight /></a></div>
            <div className="hero-proof"><div className="proof-avatars"><span>✦</span><span>↗</span><span>◌</span></div><span>Research to roadmap, in one workspace.</span></div>
          </div>
          <div className="hero-visual" aria-label="Animated startup launch workflow illustration">
            <div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="orbit orbit-c" />
            <div className="orbit-core"><div className="core-glow" /><FiZap className="core-icon" /><span>YOUR IDEA</span></div>
            <div className="orbit-node node-research"><span className="node-icon">⌕</span><span>Research</span><i /></div>
            <div className="orbit-node node-plan"><span className="node-icon">▤</span><span>Business plan</span><i /></div>
            <div className="orbit-node node-build"><span className="node-icon">⌘</span><span>Architecture</span><i /></div>
            <div className="orbit-node node-launch"><span className="node-icon">↗</span><span>Launch ready</span><i /></div>
            <div className="float-card float-market"><span className="float-label">MARKET SIGNAL</span><strong>Opportunity found</strong><div className="signal-bars"><i /><i /><i /><i /><i /><i /><i /><i /></div></div>
            <div className="float-card float-live"><FiRadio /><span>Agents at work</span><b>04 / 08</b></div>
            <div className="visual-caption"><span className="caption-line" /> ONE IDEA. A WHOLE TEAM BEHIND IT.</div>
          </div>
        </section>

        <section className="workflow-strip" id="workflow"><div className="strip-label">ONE WORKSPACE, START TO LAUNCH</div><div className="strip-items"><span><FiLayers /> Market map</span><i /><span><FiCommand /> Business plan</span><i /><span><FiZap /> Product blueprint</span><i /><span><FiPlay /> Go-to-market</span></div></section>

        <section className="how-section" id="how-it-works">
          <div className="section-heading"><div><div className="eyebrow eyebrow-muted">A CLEARER PATH FORWARD</div><h2>Turn your “what if”<br />into <span className="hero-gradient">what’s next.</span></h2></div><p>Good ideas don’t need more tabs. They need a thoughtful first step, a little momentum, and a plan you can actually use.</p></div>
          <div className="steps-grid">{work.map(([number, title, description], index) => <article className={`step-card step-${index + 1}`} key={number}><div className="step-top"><span className="step-number">{number}</span><span className="step-icon">{index === 0 ? <FiRadio /> : index === 1 ? <FiLayers /> : <FiZap />}</span></div><h3>{title}</h3><p>{description}</p><div className="step-line"><span style={{ width: `${42 + index * 24}%` }} /></div></article>)}</div>
        </section>

        <section className="start-section" id="start">
          <div className="start-copy"><div className="eyebrow"><span className="pulse-dot" /> YOUR FIRST STEP STARTS HERE</div><h2>Let’s get your<br /><span className="hero-gradient">idea in motion.</span></h2><p>A few details help your agent team build a more useful, focused launch plan.</p><div className="start-points"><span><FiCheck /> Takes about a minute</span><span><FiCheck /> Your work stays in your workspace</span></div></div>
          <form className="idea-form" onSubmit={handleSubmit}>
            <div className="form-heading"><div><span className="form-kicker">01 — THE STARTING POINT</span><h3>Tell us what you’re imagining.</h3></div><span className="form-spark">✳</span></div>
            <label className="field-label" htmlFor="idea">Your idea</label><textarea id="idea" required minLength={8} maxLength={2000} value={form.idea} onChange={(e) => setForm({ ...form, idea: e.target.value })} placeholder="A simple way for independent artists to manage their business…" />
            <div className="form-grid"><div><label className="field-label" htmlFor="industry">Industry</label><select id="industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}>{industries.map((item) => <option key={item}>{item}</option>)}</select></div><div><label className="field-label" htmlFor="model">Business model</label><select id="model" value={form.business_model} onChange={(e) => setForm({ ...form, business_model: e.target.value })}>{models.map((item) => <option key={item}>{item}</option>)}</select></div><div><label className="field-label" htmlFor="audience">Who is it for?</label><input id="audience" value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value })} placeholder="Creators, small teams…" /></div><div><label className="field-label" htmlFor="country">First market</label><input id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="United States" /></div></div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button form-submit" disabled={isLoading}>{isLoading ? <><span className="button-spinner" /> Preparing your workspace…</> : <>Create my launch plan <FiArrowRight /></>}</button><p className="form-note">No API keys needed to get started. Your plan begins as soon as you do.</p>
          </form>
        </section>
      </main>
      <footer className="footer"><a className="brand" href="#top"><span className="brand-mark"><FiZap /></span><span>launchpad<span className="brand-light">.ai</span></span></a><span>Made for the moment before it all begins.</span><button onClick={() => navigateTo('/history')}>Your past ideas <FiArrowRight /></button></footer>
    </div>
  )
}
