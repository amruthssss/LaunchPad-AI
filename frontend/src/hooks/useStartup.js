import useWebSocket from './useWebSocket'

export default function useStartup(startupId) {
  return useWebSocket(startupId || null)
}
