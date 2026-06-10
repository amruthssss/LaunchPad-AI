import { useEffect, useRef, useState } from 'react'

import useStartupStore from '../store/startupStore'

export default function useWebSocket(sessionId) {
  const socketRef = useRef(null)
  const [lastMessage, setLastMessage] = useState(null)
  const { updateStepStatus, updateOutputs, setConnected } = useStartupStore()
  const isConnected = useStartupStore((state) => state.isConnected)

  useEffect(() => {
    if (!sessionId) {
      setConnected(false)
      return undefined
    }

    const socket = new WebSocket(`ws://localhost:8000/ws/${sessionId}`)
    socketRef.current = socket

    socket.onopen = () => {
      setConnected(true)
    }

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        setLastMessage(payload)

        if (payload.step && payload.status) {
          updateStepStatus(payload.step, payload.status)
        }

        if (payload.step && payload.output) {
          updateOutputs(payload.step, payload.output)
        }
      } catch {
        setLastMessage({ raw: event.data })
      }
    }

    socket.onclose = () => {
      setConnected(false)
    }

    socket.onerror = () => {
      setConnected(false)
    }

    return () => {
      socket.close()
    }
  }, [sessionId, setConnected, updateOutputs, updateStepStatus])

  return { isConnected, lastMessage }
}
