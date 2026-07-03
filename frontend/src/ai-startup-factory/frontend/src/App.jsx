import { useEffect } from 'react';
import { useSessionStore } from './hooks/useSessionStore';
import { FormStep } from './components/FormStep';
import { WorkflowProgress } from './components/WorkflowProgress';
import { ResultsPanel } from './components/ResultsPanel';
import { SessionHistory } from './components/SessionHistory';

function AlertBanner({ type, message, onClose }) {
  if (!message) return null;

  const bgColor = type === 'error' ? 'bg-red-900/20 border-red-700/50' : 'bg-green-900/20 border-green-700/50';
  const textColor = type === 'error' ? 'text-red-300' : 'text-green-300';

  return (
    <div className={`fixed top-4 right-4 max-w-md ${bgColor} border rounded-lg p-4 ${textColor} z-40 animate-slideIn`}>
      <p>{message}</p>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-sm opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

export default function App() {
  const { currentPage, error, success, clearMessages } = useSessionStore();

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(clearMessages, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success, clearMessages]);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Error/Success Banners */}
      <AlertBanner
        type="error"
        message={error}
        onClose={clearMessages}
      />
      <AlertBanner
        type="success"
        message={success}
        onClose={clearMessages}
      />

      {/* Page Router */}
      {currentPage === 'home' && <FormStep />}
      {currentPage === 'progress' && <WorkflowProgress />}
      {currentPage === 'results' && <ResultsPanel />}
      {currentPage === 'history' && <SessionHistory />}
    </div>
  );
}
