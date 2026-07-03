import { useEffect, useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { useSessionStore } from '../hooks/useSessionStore';
import { apiClient } from '../services/apiClient';

export function SessionHistory() {
  const { sessions, setSessions, setCurrentSession, setPage, setError } = useSessionStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.getHistory();
        setSessions(response);
      } catch (error) {
        setError(error.message || 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [setSessions, setError]);

  const handleSelectSession = (session) => {
    setCurrentSession({
      session_id: session.id,
      idea: session.idea,
      industry: session.industry,
      status: {},
      outputs: {},
      created_at: session.created_at,
    });
    setPage('results');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Session History</h1>
          <p className="text-slate-400">View your past startup generations</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-slate-400">Loading history...</div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
            <p className="text-slate-400 mb-4">No sessions yet</p>
            <button
              onClick={() => setPage('home')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg transition-all"
            >
              Create Your First Startup <FiArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className="bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate mb-2">{session.idea}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                      <div>
                        <span className="text-slate-500">Industry:</span> {session.industry}
                      </div>
                      <div>
                        <span className="text-slate-500">Status:</span>{' '}
                        <span
                          className={`${
                            session.status === 'completed'
                              ? 'text-green-400'
                              : session.status === 'running'
                                ? 'text-cyan-400'
                                : 'text-red-400'
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Created:</span> {formatDate(session.created_at)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectSession(session);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded transition-colors whitespace-nowrap"
                  >
                    View <FiArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12">
          <button
            onClick={() => setPage('home')}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            ← Back Home
          </button>
        </div>
      </div>
    </div>
  );
}
