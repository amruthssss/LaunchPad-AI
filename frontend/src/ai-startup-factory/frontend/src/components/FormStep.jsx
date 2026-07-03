import { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { useSessionStore } from '../hooks/useSessionStore';
import { apiClient } from '../services/apiClient';

export function FormStep() {
  const [formData, setFormData] = useState({
    idea: '',
    industry: '',
    target_audience: '',
    country: '',
    business_model: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setCurrentSession, setPage, setLoading, setError, setSuccess } = useSessionStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.idea.trim()) {
      setError('Please enter your startup idea');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const response = await apiClient.generateStartup(formData);
      const { session_id } = response;

      setCurrentSession({
        session_id,
        ...formData,
        status: {},
        outputs: {},
        created_at: new Date().toISOString(),
      });

      setSuccess('Session created! Starting workflow...');
      setPage('progress');
    } catch (error) {
      setError(error.message || 'Failed to create session');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">AI Startup Factory</h1>
          <p className="text-slate-300 text-lg">Turn your idea into a complete startup package</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Startup Idea */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Your Startup Idea *
              </label>
              <textarea
                name="idea"
                value={formData.idea}
                onChange={handleChange}
                placeholder="Describe your startup idea in detail..."
                rows="3"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Industry *
              </label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="e.g., SaaS, FinTech, HealthTech..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Target Audience *
              </label>
              <input
                type="text"
                name="target_audience"
                value={formData.target_audience}
                onChange={handleChange}
                placeholder="e.g., Small businesses, Millennials..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Country *
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g., United States, Global..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Business Model */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Business Model *
              </label>
              <select
                name="business_model"
                value={formData.business_model}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="">Select a business model</option>
                <option value="B2B">B2B (Business to Business)</option>
                <option value="B2C">B2C (Business to Consumer)</option>
                <option value="B2B2C">B2B2C (Business to Business to Consumer)</option>
                <option value="Marketplace">Marketplace</option>
                <option value="Subscription">Subscription</option>
                <option value="Freemium">Freemium</option>
                <option value="API">API-based</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Creating startup...
                </>
              ) : (
                <>
                  Generate Startup <FiArrowRight size={18} />
                </>
              )}
            </button>

            <p className="text-xs text-slate-400 text-center">
              * indicates a required field
            </p>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>Powered by AI agents • Market Research • Business Planning • Code Generation • Forecasting</p>
        </div>
      </div>
    </div>
  );
}
