import { useEffect, useMemo, useState } from 'react'

export default function ValidationScore({ score = 0 }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const startTime = performance.now()
    const duration = 900
    let animationFrame

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1)
      setAnimatedScore(Math.round(score * progress))
      if (progress < 1) animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [score])

  const strokeColor = useMemo(() => {
    if (score < 50) return '#f43f5e'
    if (score < 75) return '#facc15'
    return '#22c55e'
  }, [score])

  const radius = 48
  const stroke = 8
  const circumference = 2 * Math.PI * radius
  const progress = circumference - (animatedScore / 100) * circumference

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-4">
        <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
          <circle cx="60" cy="60" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
            fill="none"
            style={{ transition: 'stroke-dashoffset 150ms linear' }}
          />
        </svg>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Validation Score</p>
          <p className="text-4xl font-semibold text-white">{animatedScore}</p>
          <p className="mt-1 text-sm text-slate-400">Critic review result</p>
        </div>
      </div>
    </section>
  )
}
