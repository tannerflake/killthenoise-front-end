import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import HubSpotConnectCard from '../components/HubSpotConnectCard';
import IntegrationStatus from '../components/IntegrationStatus';
import { useHubSpot } from '../hooks/useHubSpot';
import { useTenant } from '../context/TenantContext';
import { TransformedHubSpotTicket } from '../lib/api';

const Integrations: React.FC = () => {
  const { tenantId } = useTenant();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
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

  // Check HubSpot connection status
  useEffect(() => {
    const checkHubSpotStatus = async () => {
      try {
        const status = await apiClient.getHubSpotStatus(tenantId, integrationId);
        setHubspotConnected(status.connected);
        if (status.connected) {
          fetchTickets();
        }
      } catch (err) {
        console.error('Error checking HubSpot status:', err);
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

        {/* Integration Status */}
        {/* <div className="integration-content">
          <IntegrationStatus
            onRunIntegrationTest={runIntegrationTest}
            loading={loading}
          />
        </div> */}

        {/* HubSpot Integration */}
        <HubSpotConnectCard />

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
              {hubspotError && <div className="alert alert-danger mb-3">{hubspotError}</div>}

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