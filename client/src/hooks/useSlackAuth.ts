import { useState, useEffect, useRef } from 'react';
import { apiClient, SlackAuthStatus } from '../lib/api';

interface UseSlackAuthProps {
  tenantId: string;
}

interface UseSlackAuthReturn {
  authStatus: SlackAuthStatus | null;
  loading: boolean;
  polling: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  startPolling: () => void;
  stopPolling: () => void;
}

export const useSlackAuth = ({ tenantId }: UseSlackAuthProps): UseSlackAuthReturn => {
  const [authStatus, setAuthStatus] = useState<SlackAuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const checkAuth = async (isPolling: boolean = false) => {
    try {
      if (!isPolling) {
        setLoading(true);
      }
      setError(null);
      const status = await apiClient.getSlackAuthStatus(tenantId);
      setAuthStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check authentication status');
    } finally {
      if (!isPolling) {
        setLoading(false);
      }
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!authStatus?.integration_id) return false;
    
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.refreshSlackToken(tenantId, authStatus.integration_id);
      
      if (result.success) {
        // Re-check auth status after refresh
        await checkAuth();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh token');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    if (pollingRef.current) return; // Already polling
    
    setPolling(true);
    pollingRef.current = setInterval(async () => {
      await checkAuth(true); // Pass true to indicate this is a polling call
      if (authStatus?.authenticated) {
        stopPolling();
      }
    }, 3000); // Poll every 3 seconds
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setPolling(false);
  };

  useEffect(() => {
    checkAuth();
  }, [tenantId]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  return {
    authStatus,
    loading,
    polling,
    error,
    checkAuth,
    refreshToken,
    startPolling,
    stopPolling
  };
};
