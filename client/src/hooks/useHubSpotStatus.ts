import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface HubSpotStatusResponse {
  connected: boolean;
  last_sync?: string;
}

export const useHubSpotStatus = () => {
  const [status, setStatus] = useState<HubSpotStatusResponse>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await api.get<HubSpotStatusResponse>('/api/hubspot/status');
      setStatus(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching HubSpot status', err);
      // fallback: treat as disconnected when backend unreachable
      setStatus({ connected: false });
      setError('network');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 60000); // refresh each minute
    return () => clearInterval(id);
  }, []);

  return { ...status, loading, error, refresh: fetchStatus };
}; 