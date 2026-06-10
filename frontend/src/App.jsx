import { useEffect, useMemo, useState } from 'react'

import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Home from './pages/Home'

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

  return <main>{page}</main>
}
