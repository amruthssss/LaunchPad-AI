import useWebSocket from './useWebSocket'

export default function useStartup(startupId) {
  // TODO: combine REST polling, websocket updates, and state normalization.
  return useWebSocket(startupId ? `ws://localhost:8000/ws/status/${startupId}` : null)
}
