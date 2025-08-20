import React, { useState } from 'react';

interface JiraConnectProps {
  tenantId: string;
  onSuccess?: (integrationId: string) => void;
  onError?: (error: string) => void;
  onConnectStart?: () => void;
  isConnected?: boolean;
  integrationId?: string | null;
}

const JiraConnectButton: React.FC<JiraConnectProps> = ({ 
  tenantId, 
  onSuccess, 
  onError,
  onConnectStart,
  isConnected = false,
  integrationId
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    onConnectStart?.();

    try {
      // Step 1: Get authorization URL from backend
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/jira/authorize/${tenantId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to start OAuth flow');
      }

      console.log('Starting OAuth flow, redirecting to:', data.authorization_url);
      // Step 2: Redirect user to Jira OAuth page
      // The backend will handle the callback and redirect back to frontend
      window.location.href = data.authorization_url;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected) {
    return (
      <div className="jira-connect-container">
        <div className="connection-status">
          <div className="status-indicator connected">
            ✅ Connected to Jira
          </div>
          <p className="text-success mb-2">
            Your Jira integration is active and ready to use.
          </p>
          <p className="text-sm text-secondary mb-3">
            Instance: https://killthenoise.atlassian.net
          </p>
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => window.location.reload()}
          >
            Refresh Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="jira-connect-container">
      <button 
        onClick={handleConnect}
        disabled={isConnecting}
        className="connect-button"
      >
        {isConnecting ? 'Connecting...' : 'Connect to Jira'}
      </button>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default JiraConnectButton; 