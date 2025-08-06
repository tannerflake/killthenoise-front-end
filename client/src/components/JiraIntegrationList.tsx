import React, { useEffect, useState } from 'react';
import { JiraIntegrationStatus } from './JiraIntegrationStatus';

interface JiraIntegration {
  id: string;
  tenant_id: string;
  is_active: boolean;
  connection_status: {
    connected: boolean;
    user?: {
      account_id: string;
      display_name: string;
      email: string;
    };
    base_url?: string;
    error?: string;
  };
}

interface JiraIntegrationListProps {
  tenantId: string;
}

const JiraIntegrationList: React.FC<JiraIntegrationListProps> = ({ tenantId }) => {
  const [integrations, setIntegrations] = useState<JiraIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    try {
      console.log('Fetching Jira integrations for tenant:', tenantId);
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/jira/integrations/${tenantId}`
      );
      const data = await response.json();
      console.log('Jira integrations response:', data);

      if (response.ok) {
        // Show all integrations but prioritize OAuth ones
        const allIntegrations = data.integrations || [];
        console.log('All integrations found:', allIntegrations);
        
        // Filter and sort: OAuth integrations first, then others
        const sortedIntegrations = allIntegrations.sort((a: any, b: any) => {
          const aIsOAuth = a.connection_status?.connected && !a.connection_status?.error?.includes('missing access token');
          const bIsOAuth = b.connection_status?.connected && !b.connection_status?.error?.includes('missing access token');
          
          if (aIsOAuth && !bIsOAuth) return -1;
          if (!aIsOAuth && bIsOAuth) return 1;
          return 0;
        });
        
        console.log('Sorted integrations:', sortedIntegrations);
        setIntegrations(sortedIntegrations);
      } else {
        throw new Error(data.detail || 'Failed to fetch integrations');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch integrations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [tenantId]);

  if (loading) {
    return <div className="integrations-loading">Loading integrations...</div>;
  }

  if (error) {
    return <div className="integrations-error">Error: {error}</div>;
  }

  return (
    <div className="jira-integrations-list">
      <h3>Jira Integrations</h3>
      
      {integrations.length === 0 ? (
        <div className="no-integrations">
          <p>No Jira integrations found.</p>
          <p className="text-muted">Connect to Jira using the button above to get started.</p>
        </div>
      ) : (
        <div className="integrations-grid">
          {integrations.map((integration) => (
            <div key={integration.id} className="integration-card">
              <h4>Integration {integration.id.slice(0, 8)}...</h4>
              <JiraIntegrationStatus 
                tenantId={tenantId} 
                integrationId={integration.id} 
              />
            </div>
          ))}
        </div>
      )}
      
      <button onClick={fetchIntegrations} className="refresh-button">
        Refresh Integrations
      </button>
    </div>
  );
};

export default JiraIntegrationList; 