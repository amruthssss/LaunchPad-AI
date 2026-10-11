import { create } from 'zustand'

const initialState = {
  sessionId: null,
  stepStatus: {},
  allOutputs: {},
  isConnected: false,
  isLoading: false,
  error: null,
}

const useStartupStore = create((set) => ({
  ...initialState,
  setSessionId: (sessionId) => set({ sessionId }),
  updateStepStatus: (step, status) =>
    set((state) => ({
      stepStatus: {
        ...state.stepStatus,
        [step]: status,
      },
    })),
  updateOutputs: (step, output) =>
    set((state) => {
      const knownOutputs = ['market_research', 'business_plan', 'tech_architecture', 'generated_code', 'forecast', 'deployment_config', 'critic_scores']
      const looksLikeState = output && knownOutputs.some((key) => Object.hasOwn(output, key))
      return { allOutputs: looksLikeState ? { ...state.allOutputs, ...Object.fromEntries(knownOutputs.filter((key) => output[key] !== undefined).map((key) => [key, output[key]])) } : { ...state.allOutputs, [step]: output } }
    }),
  setConnected: (isConnected) => set({ isConnected }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  resetStore: () => set(initialState),
}))

export default useStartupStore
