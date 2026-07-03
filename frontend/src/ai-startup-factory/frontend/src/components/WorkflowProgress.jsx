import { useEffect } from 'react';
import { FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { useSessionStore } from '../hooks/useSessionStore';
import { useWorkflow } from '../hooks/useWorkflow';

const WORKFLOW_STEPS = [
  { id: 'market_research', label: 'Market Research', description: 'Analyzing market trends' },
  { id: 'business_planner', label: 'Business Plan', description: 'Creating business model' },
  { id: 'technical_architect', label: 'Tech Architecture', description: 'Designing tech stack' },
  { id: 'code_generator', label: 'Code Generation', description: 'Generating starter code' },
  { id: 'code_sandbox', label: 'Sandbox Test', description: 'Testing generated code' },
  { id: 'forecasting', label: 'Forecasting', description: 'Financial projections' },
  { id: 'knowledge', label: 'Knowledge Base', description: 'Adding startup insights' },
  { id: 'deployment', label: 'Deployment', description: 'Preparing deployment' },
];

function StepCard({ step, status, isLast }) {
  const getStatusIcon = () => {
    switch (status) {
      case 'done':
        return <FiCheck className="text-green-400" size={20} />;
      case 'running':
        return <FiLoader className="text-cyan-400 animate-spin" size={20} />;
      case 'failed':
        return <FiAlertCircle className="text-red-400" size={20} />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-slate-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'done':
        return 'border-green-400/30 bg-green-400/5';
      case 'running':
        return 'border-cyan-400/30 bg-cyan-400/5';
      case 'failed':
        return 'border-red-400/30 bg-red-400/5';
      default:
        return 'border-slate-600/30 bg-slate-700/30';
    }
  };

  return (
    <div className="relative">
      <div className={`border rounded-lg p-4 ${getStatusColor()} transition-all duration-300`}>
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div className="flex-1">
            <h3 className="font-semibold text-slate-100">{step.label}</h3>
            <p className="text-xs text-slate-400">{step.description}</p>
          </div>
          <span className="text-xs font-medium text-slate-400 uppercase">
            {status === 'pending' ? 'Pending' : status}
          </span>
        </div>
      </div>

      {!isLast && (
        <div className="absolute left-[26px] top-full h-2 w-0.5 bg-gradient-to-b from-slate-600 to-slate-700 -translate-x-1/2" />
      )}
    </div>
  );
}

export function WorkflowProgress() {
  const { currentSession, setPage, isWorkflowComplete } = useSessionStore();
  const ws = useWorkflow(currentSession.session_id);

  useEffect(() => {
    if (isWorkflowComplete()) {
      setTimeout(() => setPage('results'), 1000);
    }
  }, [isWorkflowComplete, setPage]);

  const completedSteps = Object.values(currentSession.status).filter((s) => s === 'done').length;
  const totalSteps = WORKFLOW_STEPS.length;
  const progressPercent = (completedSteps / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Generating Your Startup</h1>
          <p className="text-slate-400">Step {completedSteps} of {totalSteps} • {Math.round(progressPercent)}% complete</p>

          {/* Progress Bar */}
          <div className="mt-6 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {WORKFLOW_STEPS.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              status={currentSession.status[step.id] || 'pending'}
              isLast={index === WORKFLOW_STEPS.length - 1}
            />
          ))}
        </div>

        {/* Current Output Preview */}
        {Object.keys(currentSession.outputs).length > 0 && (
          <div className="mt-12 bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Latest Output</h2>
            <div className="bg-slate-900 rounded p-4 max-h-64 overflow-y-auto">
              <pre className="text-xs text-slate-300 whitespace-pre-wrap break-words">
                {JSON.stringify(
                  Object.fromEntries(
                    Object.entries(currentSession.outputs).slice(-1)
                  ),
                  null,
                  2
                ).substring(0, 500)}
                {JSON.stringify(currentSession.outputs).length > 500 && '...'}
              </pre>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-blue-400/5 border border-blue-400/30 rounded-lg p-6 text-center">
          <p className="text-slate-300">
            Your AI agents are working hard to generate a complete startup package. This usually takes 1-3 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
