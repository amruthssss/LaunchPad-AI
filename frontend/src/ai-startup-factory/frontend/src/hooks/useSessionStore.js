import { create } from 'zustand';

export const useSessionStore = create((set, get) => ({
  // UI State
  currentPage: 'home', // 'home', 'progress', 'results', 'history'
  loading: false,
  error: null,
  success: null,

  // Session Data
  sessions: [],
  currentSession: {
    session_id: null,
    idea: '',
    industry: '',
    target_audience: '',
    country: '',
    business_model: '',
    status: {},
    outputs: {},
    created_at: null,
  },

  // UI Actions
  setPage: (page) => set({ currentPage: page }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, success: null }),
  setSuccess: (success) => set({ success, error: null }),
  clearMessages: () => set({ error: null, success: null }),

  // Session Actions
  setCurrentSession: (session) => set({ currentSession: session }),

  updateSessionStatus: (step, status, output) =>
    set((state) => ({
      currentSession: {
        ...state.currentSession,
        status: {
          ...state.currentSession.status,
          [step]: status,
        },
        outputs: {
          ...state.currentSession.outputs,
          ...output,
        },
      },
    })),

  addSession: (session) =>
    set((state) => ({
      sessions: [session, ...state.sessions],
    })),

  setSessions: (sessions) => set({ sessions }),

  loadSession: (sessionId) =>
    set((state) => {
      const session = state.sessions.find((s) => s.id === sessionId);
      return session ? { currentSession: session } : {};
    }),

  resetSession: () =>
    set({
      currentSession: {
        session_id: null,
        idea: '',
        industry: '',
        target_audience: '',
        country: '',
        business_model: '',
        status: {},
        outputs: {},
        created_at: null,
      },
      error: null,
      success: null,
    }),

  // Computed selectors
  isWorkflowComplete: () => {
    const state = get();
    const { status } = state.currentSession;
    const allSteps = [
      'market_research',
      'business_planner',
      'technical_architect',
      'code_generator',
      'code_sandbox',
      'forecasting',
      'knowledge',
      'deployment',
    ];
    return allSteps.every((step) => status[step] === 'done');
  },

  getStepStatus: (step) => {
    const state = get();
    return state.currentSession.status[step] || 'pending';
  },

  getStepOutput: (key) => {
    const state = get();
    return state.currentSession.outputs[key] || null;
  },
}));
