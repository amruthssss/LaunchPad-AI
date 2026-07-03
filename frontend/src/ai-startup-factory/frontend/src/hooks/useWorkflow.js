import { useEffect, useRef } from 'react';
import { apiClient } from '../services/apiClient';
import { useSessionStore } from './useSessionStore';

export function useWorkflow(sessionId) {
  const wsRef = useRef(null);
  const { updateSessionStatus, setError } = useSessionStore();

  useEffect(() => {
    if (!sessionId) return;

    const handleMessage = (data) => {
      const { step, status, output } = data;

      // Skip certain intermediate steps for cleaner UI
      if (
        step === 'websocket' ||
        !['market_research', 'business_planner', 'technical_architect', 'code_generator', 'code_sandbox', 'forecasting', 'knowledge', 'deployment'].includes(
          step
        )
      ) {
        return;
      }

      // Extract meaningful output based on step
      let extractedOutput = {};
      if (status === 'done') {
        const stepKey = step.replace('critic_after_', '');
        extractedOutput[stepKey] = output;

        // Also store individual results if available
        if (output.market_research) {
          extractedOutput.market_research = output.market_research;
        }
        if (output.business_plan) {
          extractedOutput.business_plan = output.business_plan;
        }
        if (output.tech_architecture) {
          extractedOutput.tech_architecture = output.tech_architecture;
        }
        if (output.generated_code) {
          extractedOutput.generated_code = output.generated_code;
        }
        if (output.forecast) {
          extractedOutput.forecast = output.forecast;
        }
        if (output.deployment_config) {
          extractedOutput.deployment_config = output.deployment_config;
        }
      }

      updateSessionStatus(step, status, extractedOutput);
    };

    const handleError = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error. Please try again.');
    };

    const handleClose = () => {
      console.log('WebSocket closed');
    };

    wsRef.current = apiClient.connectWebSocket(sessionId, handleMessage, handleError, handleClose);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId, updateSessionStatus, setError]);

  return wsRef.current;
}
