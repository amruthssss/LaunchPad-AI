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
    set((state) => ({
      allOutputs: {
        ...state.allOutputs,
        [step]: output,
      },
    })),
  setConnected: (isConnected) => set({ isConnected }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  resetStore: () => set(initialState),
}))

export default useStartupStore
