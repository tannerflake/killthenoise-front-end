import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { mockHubspotIssues } from '../mock/mockHubspot';

interface Ticket {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  severity: number;
}

const HubSpotTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/api/issues', {
        params: { source: 'hubspot', limit: 5 },
      });
      setTickets(res.data.data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      // fallback to mock data
      setTickets(mockHubspotIssues);
    }
  };

  const syncTickets = async () => {
    try {
      setLoading(true);
      await api.post('/api/hubspot/sync');
      await fetchTickets();
      setLastSynced(new Date());
    } catch (err) {
      console.error('Error syncing tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="container py-4">
      <h1 className="mb-3">HubSpot Tickets</h1>
      <button className="btn btn-primary mb-4" onClick={syncTickets} disabled={loading}>
        {loading ? 'Syncing...' : 'Sync HubSpot Tickets'}
      </button>
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
          {tickets.map((t) => (
            <tr key={t.id}>
              <td>{t.title}</td>
              <td>{t.description?.substring(0, 80) || '-'}</td>
              <td>{t.severity >=4 ? 'High' : t.severity >=3 ? 'Medium' : 'Low'}</td>
              <td>{new Date(t.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
          {tickets.length === 0 && (
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