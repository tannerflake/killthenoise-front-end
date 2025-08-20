import React, { useState, useEffect } from 'react';
// import { useSearchParams } from 'react-router-dom'; // OAuth Flow (Commented Out)
import { apiClient } from '../lib/api';
import HubSpotConnectCard from '../components/HubSpotConnectCard';
import { JiraApiTokenForm } from '../components/JiraApiTokenForm';
import { JiraIntegrationStatus } from '../components/JiraIntegrationStatus';
import SlackConnectCard from '../components/SlackConnectCard';


import { useHubSpot } from '../hooks/useHubSpot';
import { useTenant } from '../context/TenantContext';
import { TransformedHubSpotTicket } from '../lib/api';

type TabType = 'jira' | 'hubspot' | 'slack';

const Integrations: React.FC = () => {
  const { tenantId } = useTenant();
  // const [searchParams] = useSearchParams(); // OAuth Flow (Commented Out)
  const [activeTab, setActiveTab] = useState<TabType>('jira');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [jiraIntegrationId, setJiraIntegrationId] = useState<string | null>(null);
  const [jiraIssues, setJiraIssues] = useState<any[]>([]);
  const [jiraLoading, setJiraLoading] = useState(false);
  const integrationId = localStorage.getItem('hubspot_integration_id') || '550e8400-e29b-41d4-a716-446655440001';
  const { listTickets, syncTickets, loading: hubspotLoading, error: hubspotError } = useHubSpot(tenantId, integrationId);
  const [tickets, setTickets] = useState<TransformedHubSpotTicket[]>([]);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [hubspotConnected, setHubspotConnected] = useState(false);

  const runIntegrationTest = async () => {
    try {
      setLoading(true);
      setMessage(null);
      await apiClient.testIntegration();
      setMessage('Integration test completed successfully!');
    } catch (err) {
      console.error('Error running integration test:', err);
      setMessage('Failed to run integration test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      console.log('Fetching tickets with integration ID:', integrationId);
      const ticketData = await listTickets(5);
      console.log('Received ticket data:', ticketData);
      setTickets(ticketData);
      setLastSynced(new Date());
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  const handleSync = async () => {
    try {
      await syncTickets('full');
      await fetchTickets();
      setLastSynced(new Date());
    } catch (err) {
      console.error('Error syncing tickets:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const fetchJiraIssues = async (integrationId: string) => {
    try {
      setJiraLoading(true);
      console.log('Fetching Jira issues for integration:', integrationId);
      console.log('Using tenant ID:', tenantId);
      
      const url = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/jira/issues/${tenantId}/${integrationId}`;
      console.log('Making request to:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Full response data:', data);

      if (response.ok) {
        console.log('Jira issues received:', data);
        const issues = data.issues || [];
        console.log('Number of issues found:', issues.length);
        setJiraIssues(issues);
      } else {
        console.error('Failed to fetch Jira issues:', data);
        console.error('Response status:', response.status);
        setJiraIssues([]);
      }
    } catch (error) {
      console.error('Error fetching Jira issues:', error);
      setJiraIssues([]);
    } finally {
      setJiraLoading(false);
    }
  };

  const checkJiraConnection = async (integrationId: string) => {
    try {
      console.log('Checking Jira connection status for:', integrationId);
      
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/jira/status/${tenantId}/${integrationId}`
      );
      const data = await response.json();

      if (response.ok && data.connection_status?.connected) {
        console.log('Jira connection confirmed:', data);
        return true;
      } else {
        console.log('Jira connection failed or not connected:', data);
        return false;
      }
    } catch (error) {
      console.error('Error checking Jira connection:', error);
      return false;
    }
  };

  // Load existing Jira integration on component mount
  useEffect(() => {
    const existingJiraId = localStorage.getItem('jira_integration_id');
    if (existingJiraId) {
      console.log('Found existing Jira integration ID:', existingJiraId);
      setJiraIntegrationId(existingJiraId);
      fetchJiraIssues(existingJiraId);
    }
  }, []);

  // Check HubSpot connection status
  useEffect(() => {
    const checkHubSpotStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/hubspot/status/${tenantId}/${integrationId}`
        );
        const data = await response.json();

        if (response.ok && data.connected) {
          console.log('HubSpot connection confirmed:', data);
          setHubspotConnected(true);
          fetchTickets();
        } else {
          console.log('HubSpot connection failed or not connected:', data);
          setHubspotConnected(false);
        }
      } catch (error) {
        console.error('Error checking HubSpot connection:', error);
        setHubspotConnected(false);
      }
    };

    checkHubSpotStatus();
  }, [tenantId, integrationId]);

  return (
    <div className="integrations-page">
      <div className="container">
        {/* Header */}
        <div className="page-header mb-4">
          <h1>Integrations</h1>
        </div>

        {/* Tab Navigation */}
        <div className="integration-tabs mb-4">
          <div className="nav nav-tabs" role="tablist">
            <button
              className={`nav-link ${activeTab === 'jira' ? 'active' : ''}`}
              onClick={() => setActiveTab('jira')}
              type="button"
              role="tab"
            >
              Jira
            </button>
            <button
              className={`nav-link ${activeTab === 'hubspot' ? 'active' : ''}`}
              onClick={() => setActiveTab('hubspot')}
              type="button"
              role="tab"
            >
              HubSpot
            </button>
            <button
              className={`nav-link ${activeTab === 'slack' ? 'active' : ''}`}
              onClick={() => setActiveTab('slack')}
              type="button"
              role="tab"
            >
              Slack
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Jira Tab */}
          {activeTab === 'jira' && (
            <div className="tab-pane fade show active">
              <div className="integration-section">
                <h3>Connect to Jira</h3>
                <p>Connect your Jira instance to sync issues and track your backlog.</p>
                
                {!jiraIntegrationId ? (
                  <JiraApiTokenForm
                    tenantId={tenantId}
                    onSuccess={(integrationId: string) => {
                      console.log('Integration created:', integrationId);
                      setJiraIntegrationId(integrationId);
                      localStorage.setItem('jira_integration_id', integrationId);
                      fetchJiraIssues(integrationId);
                    }}
                    onError={(error: string) => {
                      console.error('Connection failed:', error);
                    }}
                  />
                ) : (
                  <div className="jira-connected-status">
                    <div className="alert alert-success">
                      <h4>✅ Connected to Jira</h4>
                      <p>Your Jira integration is active and ready to use.</p>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setJiraIntegrationId(null);
                          localStorage.removeItem('jira_integration_id');
                        }}
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Debug info */}
                <div className="mt-3 p-3 bg-light rounded">
                  <h6>Debug Info:</h6>
                  <p><strong>jiraIntegrationId:</strong> {jiraIntegrationId || 'null'}</p>
                  <p><strong>isConnected:</strong> {!!jiraIntegrationId ? 'true' : 'false'}</p>
                  <p><strong>localStorage:</strong> {localStorage.getItem('jira_integration_id') || 'null'}</p>
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      console.log('Current state:', { jiraIntegrationId, localStorage: localStorage.getItem('jira_integration_id') });
                      // Force reload from backend
                      const loadJiraIntegration = async () => {
                        try {
                          const response = await fetch(
                            `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/jira/integrations/${tenantId}`
                          );
                          const data = await response.json();
                          console.log('Backend integrations:', data);
                          
                          if (response.ok && data.integrations && data.integrations.length > 0) {
                            const connectedIntegration = data.integrations.find((integration: any) => 
                              integration.connection_status?.connected
                            );
                            
                            if (connectedIntegration) {
                              console.log('Found connected integration:', connectedIntegration);
                              setJiraIntegrationId(connectedIntegration.id);
                              localStorage.setItem('jira_integration_id', connectedIntegration.id);
                              fetchJiraIssues(connectedIntegration.id);
                            }
                          }
                        } catch (error) {
                          console.error('Error loading integration:', error);
                        }
                      };
                      loadJiraIntegration();
                    }}
                  >
                    Force Refresh from Backend
                  </button>
                </div>
              </div>

              {/* Jira Integration Status */}
              {jiraIntegrationId && (
                <div className="integration-section">
                  <h3>Jira Integration Status</h3>
                  <JiraIntegrationStatus
                    tenantId={tenantId}
                    integrationId={jiraIntegrationId}
                    onRefresh={() => {
                      // Refresh issues when status is refreshed
                      fetchJiraIssues(jiraIntegrationId);
                    }}
                  />
                </div>
              )}


            </div>
          )}

          {/* HubSpot Tab */}
          {activeTab === 'hubspot' && (
            <div className="tab-pane fade show active">
              <div className="integration-section">
                <h3>HubSpot Integration</h3>
                <p>Connect your HubSpot account to import support tickets and customer feedback.</p>
                <HubSpotConnectCard />
              </div>

              {/* HubSpot Tickets Display - Only show when connected */}
              {hubspotConnected && (
                <div className="card mt-4">
                  <div className="card-header">
                    <div className="d-flex justify-between align-start">
                      <div>
                        <h3>HubSpot Tickets</h3>
                        {lastSynced && (
                          <p className="text-sm text-secondary mb-0">Last sync: {lastSynced.toLocaleDateString()} @ {lastSynced.toLocaleTimeString()}</p>
                        )}
                      </div>
                      <button className="btn btn-primary" onClick={handleSync} disabled={hubspotLoading}>
                        {hubspotLoading ? 'Syncing...' : 'Sync HubSpot Tickets'}
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    {hubspotError && <div className="alert alert-danger mb-3">{typeof hubspotError === 'string' ? hubspotError : JSON.stringify(hubspotError)}</div>}

                    <table className="table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Description</th>
                          <th>Priority</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets && tickets.length > 0 ? tickets.map((t) => (
                          <tr key={t.id}>
                            <td>{t.title}</td>
                            <td>{t.description?.substring(0, 80) || '-'}</td>
                            <td>{t.severity >=4 ? 'High' : t.severity >=3 ? 'Medium' : 'Low'}</td>
                            <td>{new Date(t.created_at).toLocaleDateString()}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="text-center text-secondary">
                              No HubSpot tickets found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Slack Tab */}
          {activeTab === 'slack' && (
            <div className="tab-pane fade show active">
              <div className="integration-section">
                <h3>Slack Integration</h3>
                <p>Connect your Slack workspace to sync messages and analyze them for customer issues.</p>
                
                <SlackConnectCard />

                <div className="mt-4 p-3 bg-light rounded">
                  <h6 className="mb-2">💡 How it works</h6>
                  <ol className="mb-0 small">
                    <li>Connect your Slack workspace using OAuth (no manual token needed)</li>
                    <li>Select channels containing customer feedback or bug reports</li>
                    <li>Sync messages to analyze for issues and patterns</li>
                    <li>View AI-grouped issues on the Dashboard with Slack source data</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Message */}
        {message && (
          <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} mt-4`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Integrations; 