import React, { useState } from 'react';
import { api } from '../lib/api';
import IntegrationStatus from '../components/IntegrationStatus';

const Integrations: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

                const runIntegrationTest = async () => {
                try {
                  setLoading(true);
                  setMessage(null);
                  await api.post('/api/integrations/test');
                  setMessage('Integration test completed successfully!');
                } catch (err) {
                  console.error('Error running integration test:', err);
                  setMessage('Failed to run integration test. Please try again.');
                } finally {
                  setLoading(false);
                }
              };

              const runJiraMatching = async () => {
                try {
                  setLoading(true);
                  setMessage(null);
                  await api.post('/api/jira/match-all');
                  setMessage('Jira matching completed successfully!');
                } catch (err) {
                  console.error('Error running Jira matching:', err);
                  setMessage('Failed to run Jira matching. Please try again.');
                } finally {
                  setLoading(false);
                }
              };

  return (
    <div className="integrations-page">
      <div className="container">
        {/* Header */}
        <div className="page-header mb-4">
          <h1>Integrations</h1>
          <p className="text-secondary">
            Manage data source connections and test integrations
          </p>
        </div>

                            {/* Integration Status */}
                    <div className="integration-content">
                      <IntegrationStatus
                        onRunIntegrationTest={runIntegrationTest}
                        loading={loading}
                      />
                    </div>

                    {/* Jira Matching */}
                    <div className="card mt-4">
                      <div className="card-header">
                        <h3>Jira Integration</h3>
                      </div>
                      <div className="card-body">
                        <p className="text-secondary mb-3">
                          Use AI to match existing issues with Jira tickets and update their status.
                        </p>
                        <button
                          className="btn btn-primary"
                          onClick={runJiraMatching}
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Run Jira Matching'}
                        </button>
                      </div>
                    </div>

                    {/* HubSpot Integration */}
                    <div className="card mt-4">
                      <div className="card-header">
                        <h3>HubSpot Integration</h3>
                      </div>
                      <div className="card-body">
                        <p className="text-secondary mb-3">
                          Connect your HubSpot account to import support tickets and customer feedback.
                        </p>
                        <a
                          className="btn btn-orange"
                          href="https://app-na2.hubspot.com/oauth/authorize?client_id=c4f6d977-f797-4c43-9e9d-9bc867ea01ac&redirect_uri=http://localhost:5001/api/hubspot/callback&scope=tickets%20oauth"
                        >
                          Connect to HubSpot
                        </a>
                      </div>
                    </div>

        {/* Status Message */}
        {message && (
          <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} mt-4`}>
            {message}
          </div>
        )}

        {/* Integration Documentation */}
        <div className="integration-docs mt-5">
          <div className="card">
            <div className="card-header">
              <h3>Integration Setup Guide</h3>
            </div>
            <div className="card-body">
              <div className="integration-guide">
                <h4>Current Status</h4>
                <p className="text-secondary">
                  All integrations are currently using mock data for demonstration purposes. 
                  To implement real integrations, follow the setup guide in the project documentation.
                </p>
                
                <h4>Available Integrations</h4>
                <ul className="integration-list">
                  <li>
                    <strong>Slack</strong> - Customer support channels and feedback
                    <br />
                    <span className="text-sm text-secondary">Status: Mock data only</span>
                  </li>
                  <li>
                    <strong>HubSpot</strong> - Support tickets and customer feedback
                    <br />
                    <span className="text-sm text-secondary">Status: Mock data only</span>
                  </li>
                  <li>
                    <strong>Jira</strong> - Bug reports and feature requests
                    <br />
                    <span className="text-sm text-secondary">Status: Mock data only</span>
                  </li>
                  <li>
                    <strong>Google Docs</strong> - User feedback documents
                    <br />
                    <span className="text-sm text-secondary">Status: Mock data only</span>
                  </li>
                </ul>

                <h4>Next Steps</h4>
                <p className="text-secondary">
                  To implement real integrations:
                </p>
                <ol className="setup-steps">
                  <li>Obtain API credentials from each platform</li>
                  <li>Update environment variables with your API keys</li>
                  <li>Replace mock data methods in <code>integrationService.ts</code></li>
                  <li>Test each integration individually</li>
                  <li>Configure scheduling for automatic data ingestion</li>
                </ol>

                <div className="integration-links mt-4">
                  <h4>Documentation</h4>
                  <ul>
                    <li><a href="https://api.slack.com/" target="_blank" rel="noopener noreferrer">Slack API Documentation</a></li>
                    <li><a href="https://developers.hubspot.com/" target="_blank" rel="noopener noreferrer">HubSpot API Documentation</a></li>
                    <li><a href="https://developer.atlassian.com/cloud/jira/platform/rest/v3/" target="_blank" rel="noopener noreferrer">Jira REST API</a></li>
                    <li><a href="https://developers.google.com/docs/api" target="_blank" rel="noopener noreferrer">Google Docs API</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations; 