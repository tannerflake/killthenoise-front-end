import React, { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

interface JiraIntegrationStatusProps {
  tenantId: string;
  integrationId: string;
  onRefresh?: () => void;
}

export const JiraIntegrationStatus: React.FC<JiraIntegrationStatusProps> = ({
  tenantId,
  integrationId,
  onRefresh
}) => {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStatus = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.getJiraStatus(tenantId, integrationId);

      if (response.connected !== undefined) {
        setStatus(response);
      } else {
        setError('Failed to fetch status');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [tenantId, integrationId]);

  const handleRefresh = () => {
    fetchStatus();
    onRefresh?.();
  };

  if (isLoading) {
    return (
      <div className="jira-status-card">
        <div className="card-body">
          <p>Loading status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="jira-status-card">
        <div className="card-body">
          <div className="alert alert-danger">
            Error: {error}
          </div>
          <button onClick={handleRefresh} className="btn btn-outline-secondary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="jira-status-card">
      <div className="card-body">
        <div className="status-header">
          {status?.connected ? (
            <span className="status-indicator connected">✅ Connected</span>
          ) : (
            <span className="status-indicator disconnected">❌ Disconnected</span>
          )}
          <h4>Jira Integration Status</h4>
        </div>

        {status?.connected && (
          <div className="status-details">
            <p><strong>Base URL:</strong> {status.base_url}</p>
            {status.user && (
              <p><strong>User:</strong> {status.user.display_name} ({status.user.email})</p>
            )}
            <p><strong>Method:</strong> {status.method}</p>
          </div>
        )}

        {status?.error && (
          <div className="alert alert-warning">
            <p>{status.error}</p>
          </div>
        )}

        <button
          onClick={handleRefresh}
          className="btn btn-outline-secondary"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
}; 