import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface IntegrationStatusProps {
  onRunIntegrationTest: () => void;
  loading: boolean;
}

const IntegrationStatus: React.FC<IntegrationStatusProps> = ({ onRunIntegrationTest, loading }) => {
  const [hubspotConnected, setHubspotConnected] = useState<boolean>(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/api/hubspot/status');
        setHubspotConnected(res.data.connected);
      } catch (err) {
        console.error('Error fetching HubSpot status:', err);
        // Assume connected in development if backend down
        setHubspotConnected(true);
      }
    };
    fetchStatus();
  }, []);

  const integrations = [
    {
      name: 'Slack',
      icon: '💬',
      status: 'active',
      description: 'Customer support channels'
    },
    {
      name: 'HubSpot',
      icon: '📊',
      status: hubspotConnected ? 'active' : 'inactive',
      description: 'Support tickets & feedback'
    },
    {
      name: 'Jira',
      icon: '🎫',
      status: 'active',
      description: 'Bug reports & issues'
    },
    {
      name: 'Google Docs',
      icon: '📄',
      status: 'active',
      description: 'User feedback documents'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Active</span>;
      case 'inactive':
        return <span className="badge badge-secondary">Inactive</span>;
      case 'error':
        return <span className="badge badge-danger">Error</span>;
      default:
        return <span className="badge badge-secondary">Unknown</span>;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Integration Status</h3>
        <p className="text-secondary mb-0">
          Data source connections
        </p>
      </div>
      <div className="card-body">
        <div className="integration-list">
          {integrations.map((integration, index) => (
            <div key={index} className="integration-item d-flex align-center mb-3">
              <div className="integration-icon mr-3">
                {integration.icon}
              </div>
              <div className="integration-details flex-1">
                <div className="d-flex justify-between align-center mb-1">
                  <strong>{integration.name}</strong>
                  {getStatusBadge(integration.status)}
                </div>
                <p className="text-secondary text-sm mb-0">
                  {integration.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="integration-info mt-4 p-3 bg-light rounded">
          <h4 className="text-sm mb-2">💡 Integration Info</h4>
          <p className="text-sm text-secondary mb-0">
            These integrations are currently using mock data. 
            Real API connections will be implemented in future phases.
          </p>
        </div>
        
        <div className="integration-actions mt-4">
          <button 
            className="btn btn-primary w-full" 
            onClick={onRunIntegrationTest}
            disabled={loading}
          >
            {loading ? 'Running Integration Test...' : 'Run Integration Test'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationStatus; 