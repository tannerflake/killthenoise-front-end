import React, { useState } from 'react';
import { useHubSpotAuth } from '../hooks/useHubSpotAuth';
import { apiClient } from '../lib/api';
import { useTenant } from '../context/TenantContext';

const HubSpotConnectCard: React.FC = () => {
  const { tenantId } = useTenant();
  const { authStatus, loading, polling, error, checkAuth, refreshToken, startPolling, stopPolling } = useHubSpotAuth({ tenantId });
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const result = await apiClient.getHubSpotAuthUrl(tenantId);
      
      if (result.success) {
        // Open OAuth URL in new window
        window.open(result.authorization_url, '_blank', 'width=600,height=700');
        
        // Start polling for authentication completion
        startPolling();
        
        // Stop polling after 5 minutes
        setTimeout(() => {
          stopPolling();
          setConnecting(false);
        }, 300000);
      }
    } catch (err) {
      console.error('Failed to start OAuth flow:', err);
      setConnecting(false);
    }
  };

  const handleRefresh = async () => {
    const success = await refreshToken();
    if (success) {
      console.log('Token refreshed successfully');
    }
  };

  // Show loading only on initial load, not during polling
  if (loading && !polling) {
    return (
      <div className="card mt-4">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span>Checking HubSpot connection...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card mt-4">
        <div className="card-body">
          <div className="alert alert-danger">
            <strong>Error:</strong> {error}
          </div>
          <button className="btn btn-primary" onClick={checkAuth}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (authStatus?.authenticated) {
    return (
      <div className="card mt-4">
        <div className="card-header bg-success-subtle">
          <div className="d-flex justify-content-between align-items-center">
            <h3>HubSpot Integration</h3>
            <div className="d-flex align-items-center">
              <span className="text-success fw-bold me-2">Connected ✔</span>
              {polling && (
                <div className="spinner-border spinner-border-sm text-success" role="status">
                  <span className="visually-hidden">Refreshing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              {authStatus.hub_domain && (
                <div className="mb-2">
                  <strong>Hub Domain:</strong> {authStatus.hub_domain}
                </div>
              )}
              {authStatus.scopes && authStatus.scopes.length > 0 && (
                <div className="mb-2">
                  <strong>Scopes:</strong> {authStatus.scopes.join(', ')}
                </div>
              )}
              <div className="text-muted small">
                {authStatus.message}
              </div>
            </div>
            <div className="col-md-4 text-end">
              <button 
                className="btn btn-outline-primary btn-sm" 
                onClick={handleRefresh} 
                disabled={connecting || loading}
              >
                Refresh Token
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authStatus?.can_refresh) {
    return (
      <div className="card mt-4">
        <div className="card-header bg-warning-subtle">
          <div className="d-flex justify-content-between align-items-center">
            <h3>HubSpot Integration</h3>
            <span className="text-warning fw-bold">⚠️ Token Expired</span>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <p className="text-muted mb-0">
                Your HubSpot token has expired, but it can be refreshed automatically.
              </p>
            </div>
            <div className="col-md-4 text-end">
              <button 
                className="btn btn-warning" 
                onClick={handleRefresh} 
                disabled={connecting || loading}
              >
                {loading ? 'Refreshing...' : 'Refresh Connection'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-4">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h3>HubSpot Integration</h3>
          <div className="d-flex align-items-center">
            <span className="text-muted me-2">🔗</span>
            {polling && (
              <div className="spinner-border spinner-border-sm text-muted" role="status">
                <span className="visually-hidden">Checking...</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-8">
            <p className="text-muted mb-0">
              Connect your HubSpot account to sync tickets and issues.
            </p>
            {polling && (
              <div className="text-muted small mt-2">
                <i className="fas fa-sync-alt me-1"></i>
                Waiting for authentication...
              </div>
            )}
          </div>
          <div className="col-md-4 text-end">
            <button 
              className="btn btn-primary" 
              onClick={handleConnect} 
              disabled={connecting || polling}
            >
              {connecting ? 'Connecting...' : 'Connect to HubSpot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HubSpotConnectCard; 