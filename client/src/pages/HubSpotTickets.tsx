import React, { useEffect, useState } from 'react';
import { useHubSpot } from '../hooks/useHubSpot';
import { useTenant } from '../context/TenantContext';
import { TransformedHubSpotTicket } from '../lib/api';

// Use HubSpotTicket type from API instead of local Ticket interface
const HubSpotTickets: React.FC = () => {
  const { tenantId } = useTenant();
  const integrationId = localStorage.getItem('hubspot_integration_id') || '550e8400-e29b-41d4-a716-446655440001';
  const { listTickets, syncTickets, loading, error } = useHubSpot(tenantId, integrationId);
  const [tickets, setTickets] = useState<TransformedHubSpotTicket[]>([]);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const fetchTickets = async () => {
    try {
      console.log('Fetching tickets with integration ID:', integrationId);
      const ticketData = await listTickets(5);
      console.log('Received ticket data:', ticketData);
      setTickets(ticketData);
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

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="container py-4">
      <h1 className="mb-3">HubSpot Tickets</h1>
      <div className="mb-3 p-2 bg-light rounded">
        <small className="text-muted">
          Debug: Integration ID: {integrationId}
          <br />
          Tickets count: {tickets.length}
          <br />
          Error: {error || 'none'}
          <br />
          <button 
            className="btn btn-sm btn-outline-secondary" 
            onClick={() => {
              localStorage.setItem('hubspot_integration_id', '382db926-cc25-40a4-8c60-81459b15826a');
              window.location.reload();
            }}
          >
            Fix Integration ID
          </button>
          <button 
            className="btn btn-sm btn-outline-primary ml-2" 
            onClick={fetchTickets}
          >
            Debug Fetch
          </button>
        </small>
      </div>
      <button className="btn btn-primary mb-4" onClick={handleSync} disabled={loading}>
        {loading ? 'Syncing...' : 'Sync HubSpot Tickets'}
      </button>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      {lastSynced && (
        <p className="text-sm text-secondary mb-3">Last synced: {lastSynced.toLocaleTimeString()}</p>
      )}

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
  );
};

export default HubSpotTickets; 