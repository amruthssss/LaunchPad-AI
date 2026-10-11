import { Suspense, lazy, useEffect, useMemo, useState } from 'react'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const History = lazy(() => import('./pages/History'))
const Home = lazy(() => import('./pages/Home'))

function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return pathname
}

export default function App() {
  const pathname = usePathname()

  const page = useMemo(() => {
    if (pathname.startsWith('/dashboard/')) {
      return <Dashboard />
    }

    if (pathname === '/history') {
      return <History />
    }

    return <Home />
  }, [pathname])

  return <main key={pathname} className="animate-in"><Suspense fallback={<div className="min-h-screen bg-slate-950" aria-label="Loading page" />}>
    {page}
  </Suspense></main>
}
