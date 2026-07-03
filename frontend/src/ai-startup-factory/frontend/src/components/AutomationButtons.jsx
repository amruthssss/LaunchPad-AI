import { useState } from 'react';
import { FiGithub, FiMail, FiSlack, FiDownload } from 'react-icons/fi';
import { apiClient } from '../services/apiClient';
import { useSessionStore } from '../hooks/useSessionStore';

function AutomationButton({ icon: Icon, label, onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
    >
      {loading ? (
        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
      ) : (
        <Icon size={18} />
      )}
      {label}
    </button>
  );
}

export function AutomationButtons() {
  const { currentSession, setSuccess, setError } = useSessionStore();
  const [loading, setLoading] = useState({});
  const [emailModal, setEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  const { session_id } = currentSession;

  const handleGithub = async () => {
    setLoading((prev) => ({ ...prev, github: true }));
    try {
      const response = await apiClient.triggerGithub(session_id);
      if (response.success) {
        setSuccess(`✓ Repository created: ${response.repo_url}`);
      } else {
        setError('Failed to create GitHub repository');
      }
    } catch (error) {
      setError(error.message || 'GitHub automation failed');
    } finally {
      setLoading((prev) => ({ ...prev, github: false }));
    }
  };

  const handleNotion = async () => {
    setLoading((prev) => ({ ...prev, notion: true }));
    try {
      const response = await apiClient.triggerNotion(session_id);
      if (response.success) {
        setSuccess('✓ Notion document created');
      } else {
        setError('Failed to create Notion document');
      }
    } catch (error) {
      setError(error.message || 'Notion automation failed');
    } finally {
      setLoading((prev) => ({ ...prev, notion: false }));
    }
  };

  const handleEmail = async () => {
    if (!emailAddress.trim()) {
      setError('Please enter an email address');
      return;
    }

    setLoading((prev) => ({ ...prev, email: true }));
    try {
      const response = await apiClient.triggerEmail(session_id, emailAddress);
      if (response.success) {
        setSuccess(`✓ Report sent to ${emailAddress}`);
        setEmailModal(false);
        setEmailAddress('');
      } else {
        setError('Failed to send email');
      }
    } catch (error) {
      setError(error.message || 'Email automation failed');
    } finally {
      setLoading((prev) => ({ ...prev, email: false }));
    }
  };

  const handleSlack = async () => {
    setLoading((prev) => ({ ...prev, slack: true }));
    try {
      const response = await apiClient.triggerSlack(session_id);
      if (response.success) {
        setSuccess('✓ Slack message posted');
      } else {
        setError('Failed to post to Slack');
      }
    } catch (error) {
      setError(error.message || 'Slack automation failed');
    } finally {
      setLoading((prev) => ({ ...prev, slack: false }));
    }
  };

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Automation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AutomationButton
            icon={FiGithub}
            label="Deploy to GitHub"
            onClick={handleGithub}
            loading={loading.github}
          />
          <AutomationButton
            icon={FiDownload}
            label="Create Notion Doc"
            onClick={handleNotion}
            loading={loading.notion}
          />
          <AutomationButton
            icon={FiMail}
            label="Email Report"
            onClick={() => setEmailModal(true)}
            loading={loading.email}
          />
          <AutomationButton
            icon={FiSlack}
            label="Post to Slack"
            onClick={handleSlack}
            loading={loading.slack}
          />
        </div>
      </div>

      {/* Email Modal */}
      {emailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
            <h4 className="text-lg font-semibold text-white mb-4">Send Report via Email</h4>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEmailModal(false);
                  setEmailAddress('');
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEmail}
                disabled={loading.email}
                className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 text-white rounded transition-colors flex items-center justify-center gap-2"
              >
                {loading.email ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <FiMail size={16} />
                )}
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
