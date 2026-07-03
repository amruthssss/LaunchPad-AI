import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useSessionStore } from '../hooks/useSessionStore';
import { CodeViewer } from './CodeViewer';
import { ForecastChart } from './ForecastChart';
import { AutomationButtons } from './AutomationButtons';

function ResultTab({ title, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium border-b-2 transition-colors ${
        active
          ? 'border-cyan-500 text-cyan-400'
          : 'border-transparent text-slate-400 hover:text-slate-300'
      }`}
    >
      {title}
    </button>
  );
}

function ExpandableSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-800 hover:bg-slate-700 transition-colors"
      >
        <h3 className="font-semibold text-white">{title}</h3>
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {open && <div className="p-6 bg-slate-900/50">{children}</div>}
    </div>
  );
}

export function ResultsPanel() {
  const { currentSession, setPage } = useSessionStore();
  const [activeTab, setActiveTab] = useState('market');
  const { outputs } = currentSession;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'market':
        return (
          <div className="space-y-4">
            {outputs.market_research ? (
              <ExpandableSection title="Market Research" defaultOpen>
                <div className="space-y-3">
                  {typeof outputs.market_research === 'string' ? (
                    <p className="text-slate-300">{outputs.market_research}</p>
                  ) : (
                    Object.entries(outputs.market_research).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm font-medium text-slate-400">{key}:</p>
                        <p className="text-slate-200">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ExpandableSection>
            ) : (
              <p className="text-slate-400">No market research data</p>
            )}
          </div>
        );

      case 'business':
        return (
          <div className="space-y-4">
            {outputs.business_plan ? (
              <ExpandableSection title="Business Plan" defaultOpen>
                <div className="space-y-3">
                  {typeof outputs.business_plan === 'string' ? (
                    <p className="text-slate-300">{outputs.business_plan}</p>
                  ) : (
                    Object.entries(outputs.business_plan).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm font-medium text-slate-400">{key}:</p>
                        <p className="text-slate-200">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ExpandableSection>
            ) : (
              <p className="text-slate-400">No business plan data</p>
            )}
          </div>
        );

      case 'tech':
        return (
          <div className="space-y-4">
            {outputs.tech_architecture ? (
              <ExpandableSection title="Tech Architecture" defaultOpen>
                <div className="space-y-3">
                  {typeof outputs.tech_architecture === 'string' ? (
                    <p className="text-slate-300">{outputs.tech_architecture}</p>
                  ) : (
                    Object.entries(outputs.tech_architecture).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm font-medium text-slate-400">{key}:</p>
                        <p className="text-slate-200">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ExpandableSection>
            ) : (
              <p className="text-slate-400">No architecture data</p>
            )}
          </div>
        );

      case 'code':
        return (
          <div className="space-y-4">
            {outputs.generated_code ? (
              Object.entries(outputs.generated_code).map(([filename, content]) => (
                <CodeViewer
                  key={filename}
                  filename={filename}
                  code={typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                />
              ))
            ) : (
              <p className="text-slate-400">No generated code</p>
            )}
          </div>
        );

      case 'forecast':
        return (
          <div className="space-y-4">
            {outputs.forecast ? (
              <>
                {Array.isArray(outputs.forecast) ? (
                  <ForecastChart data={outputs.forecast} type="revenue" title="Revenue Forecast" />
                ) : (
                  <ExpandableSection title="Forecast Data" defaultOpen>
                    <pre className="text-xs text-slate-300 overflow-x-auto">
                      {JSON.stringify(outputs.forecast, null, 2)}
                    </pre>
                  </ExpandableSection>
                )}
              </>
            ) : (
              <p className="text-slate-400">No forecast data</p>
            )}
          </div>
        );

      case 'deployment':
        return (
          <div className="space-y-4">
            {outputs.deployment_config ? (
              <ExpandableSection title="Deployment Config" defaultOpen>
                <pre className="text-xs text-slate-300 overflow-x-auto">
                  {typeof outputs.deployment_config === 'string'
                    ? outputs.deployment_config
                    : JSON.stringify(outputs.deployment_config, null, 2)}
                </pre>
              </ExpandableSection>
            ) : (
              <p className="text-slate-400">No deployment config</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Startup Package</h1>
          <p className="text-slate-400">All generated outputs are ready</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-slate-700 flex overflow-x-auto">
          <ResultTab title="Market" active={activeTab === 'market'} onClick={() => setActiveTab('market')} />
          <ResultTab
            title="Business"
            active={activeTab === 'business'}
            onClick={() => setActiveTab('business')}
          />
          <ResultTab title="Tech" active={activeTab === 'tech'} onClick={() => setActiveTab('tech')} />
          <ResultTab title="Code" active={activeTab === 'code'} onClick={() => setActiveTab('code')} />
          <ResultTab
            title="Forecast"
            active={activeTab === 'forecast'}
            onClick={() => setActiveTab('forecast')}
          />
          <ResultTab
            title="Deployment"
            active={activeTab === 'deployment'}
            onClick={() => setActiveTab('deployment')}
          />
        </div>

        {/* Content */}
        <div className="mb-12">{renderTabContent()}</div>

        {/* Automation Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8">
          <AutomationButtons />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => setPage('home')}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Back Home
          </button>
          <button
            onClick={() => setPage('history')}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
}
