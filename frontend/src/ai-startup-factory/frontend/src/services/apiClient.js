const API_BASE_URL = 'http://localhost:8000/api';

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `API error: ${response.status}`);
    }

    return response.json();
  }

  // Startup endpoints
  async generateStartup(data) {
    return this.request('/startup/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStatus(sessionId) {
    return this.request(`/startup/${sessionId}/status`, {
      method: 'GET',
    });
  }

  async getReport(sessionId) {
    return this.request(`/startup/${sessionId}/report`, {
      method: 'GET',
    });
  }

  async getHistory() {
    return this.request('/startup/history', {
      method: 'GET',
    });
  }

  async uploadPdf(sessionId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}/startup/${sessionId}/upload-pdf`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload PDF: ${response.status}`);
    }

    return response.json();
  }

  // Automation endpoints
  async triggerGithub(sessionId) {
    return this.request(`/automation/github/${sessionId}`, {
      method: 'POST',
    });
  }

  async triggerNotion(sessionId) {
    return this.request(`/automation/notion/${sessionId}`, {
      method: 'POST',
    });
  }

  async triggerEmail(sessionId, toEmail) {
    return this.request(`/automation/email/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify({ to_email: toEmail }),
    });
  }

  async triggerSlack(sessionId) {
    return this.request(`/automation/slack/${sessionId}`, {
      method: 'POST',
    });
  }

  // WebSocket
  connectWebSocket(sessionId, onMessage, onError, onClose) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//localhost:8000/ws/${sessionId}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (onError) onError(error);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      if (onClose) onClose();
    };

    return ws;
  }
}

export const apiClient = new ApiClient();
