import { useState, useEffect } from 'react';
import { apiClient, Issue } from '../lib/api';

export const useIssues = (source?: string, limit: number = 10) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const response = await apiClient.listIssues(source, limit);
        setIssues(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch issues');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [source, limit]);

  return { issues, loading, error };
};

export const useTopIssues = (limit: number = 10) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopIssues = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getTopIssues(limit);
        setIssues(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch top issues');
      } finally {
        setLoading(false);
      }
    };

    fetchTopIssues();
  }, [limit]);

  return { issues, loading, error };
}; 