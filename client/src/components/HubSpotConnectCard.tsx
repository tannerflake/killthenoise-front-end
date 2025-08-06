import { apiClient } from '../lib/api';
import { useTenant } from '../context/TenantContext';
import { useState, useEffect } from 'react';
import { HubSpotStatus } from '../lib/api';

const HubSpotConnectCard: React.FC = () => {
  const { tenantId } = useTenant();
  const [integrationId, setIntegrationId] = useState<string>(() => {
    return localStorage.getItem('hubspot_integration_id') || '550e8400-e29b-41d4-a716-446655440001';
  });
  const [status, setStatus] = useState<HubSpotStatus>({ connected: false });
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isLoading = loading || statusLoading;

  const fetchStatus = async () => {
    try {
      setStatusLoading(true);
      const hubspotStatus = await apiClient.getHubSpotStatus(tenantId, integrationId);
      setStatus(hubspotStatus);
      setError(null);
    } catch (err) {
      console.error('Error fetching HubSpot status', err);
      setStatus({ connected: false });
      setError('network');
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 60000); // refresh each minute
    return () => clearInterval(id);
  }, [tenantId, integrationId]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const authData = await apiClient.getHubSpotAuthUrl(tenantId);
      // Update integration ID from the response
      if (authData.integration_id) {
        setIntegrationId(authData.integration_id);
        localStorage.setItem('hubspot_integration_id', authData.integration_id);
      }
      // Store state for CSRF protection
      const stateParam = authData.authorization_url.match(/state=([^&]+)/)?.[1];
      if (stateParam) {
        sessionStorage.setItem('hubspot_oauth_state', stateParam);
      }
      window.location.assign(authData.authorization_url);
    } catch (err) {
      console.error('Error initiating HubSpot OAuth', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      // Note: Backend doesn't have a delete endpoint in the guide,
      // so this would need to be implemented
      console.log('Disconnect not implemented in backend yet');
      fetchStatus();
    } catch (err) {
      console.error('Error disconnecting HubSpot', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mt-4">
      <div className={`card-header ${status.connected ? 'bg-success-subtle' : ''}`}>
        <div className="d-flex justify-between align-center">
          <h3>HubSpot Integration</h3>
          {status.connected && (
            <span className="text-success font-weight-bold">Connected ✔</span>
          )}
        </div>
      </div>
      <div className="card-body">
        {!status.connected && (
          <div className="d-flex justify-between align-center">
            <p className="text-secondary mb-0">
              Connect your HubSpot account to import support tickets and customer feedback.
            </p>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  localStorage.removeItem('hubspot_integration_id');
                  window.location.reload();
                }}
              >
                Reset
              </button>
              <button className="btn btn-primary" onClick={handleConnect} disabled={isLoading}>
                {isLoading ? 'Connecting…' : 'Connect HubSpot'}
              </button>
            </div>
          </div>
        )}

        {status.connected && (
          <div className="d-flex justify-between align-center">
            <div>
              {status.last_sync && (
                <p className="text-sm text-secondary mb-0">Last sync: {new Date(status.last_sync).toLocaleString()}</p>
              )}
            </div>
            <button className="btn btn-danger" onClick={handleDisconnect} disabled={isLoading}>
              {isLoading ? 'Disconnecting…' : 'Disconnect'}
            </button>
          </div>
        )}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>
    </div>
  );
};

export default HubSpotConnectCard; 