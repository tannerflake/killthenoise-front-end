import { useState, useEffect } from 'react';
import { apiClient, HubSpotAuthStatus } from '../lib/api';

interface UseHubSpotAuthProps {
  tenantId: string;
}

interface UseHubSpotAuthReturn {
  authStatus: HubSpotAuthStatus | null;
  loading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

export const useHubSpotAuth = ({ tenantId }: UseHubSpotAuthProps): UseHubSpotAuthReturn => {
  const [authStatus, setAuthStatus] = useState<HubSpotAuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await apiClient.getHubSpotAuthStatus(tenantId);
      setAuthStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check authentication status');
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!authStatus?.integration_id) return false;
    
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.refreshHubSpotToken(tenantId, authStatus.integration_id);
      
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

  useEffect(() => {
    checkAuth();
  }, [tenantId]);

  return {
    authStatus,
    loading,
    error,
    checkAuth,
    refreshToken
  };
};
