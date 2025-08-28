import React, { useState } from 'react';
import { useSlackAuth } from '../hooks/useSlackAuth';
import { apiClient } from '../lib/api';
import { useTenant } from '../context/TenantContext';

const SlackConnectCard: React.FC = () => {
  const { tenantId } = useTenant();
  const { authStatus, loading, polling, error, checkAuth, refreshToken, startPolling, stopPolling } = useSlackAuth({ tenantId });
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const handleConnect = async () => {
    console.log('🚀 handleConnect called');
    try {
      setConnecting(true);
      setConnectError(null); // Clear any previous errors
      const result = await apiClient.getSlackAuthUrl(tenantId);
      
      if (result.success) {
        // Open OAuth URL in new window
        const popup = window.open(result.authorization_url, '_blank', 'width=600,height=700');
        
        if (!popup) {
          throw new Error('Popup blocked! Please allow popups and try again.');
        }
        
        // Start polling for authentication completion
        startPolling();
        
        // Check if popup was closed by user
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            console.log('🔍 OAuth popup was closed by user');
            stopPolling();
            setConnecting(false);
          }
        }, 1000);
        
        // Stop polling after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed);
          stopPolling();
          setConnecting(false);
          console.log('⏰ OAuth timeout after 5 minutes');
        }, 300000);
      } else if (result.needs_disconnect) {
        // Handle existing integration case
        const shouldDisconnect = window.confirm(
          `${result.message}\n\nWould you like to disconnect the existing integration and reconnect?`
        );
        
        if (shouldDisconnect) {
          try {
            await apiClient.disconnectSlack(tenantId);
            // Try connecting again after disconnect
            await handleConnect();
          } catch (disconnectErr) {
            console.error('Failed to disconnect Slack:', disconnectErr);
            setConnecting(false);
          }
        } else {
          setConnecting(false);
        }
      } else {
        throw new Error(result.message || 'Failed to start Slack authorization');
      }
    } catch (err: any) {
      console.error('Failed to start OAuth flow:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.log('🔄 Setting connecting to false and error state...');
      setConnecting(false);
      
      // Show user-friendly error message
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to start Slack authorization';
      console.log('📝 Setting error message:', errorMessage);
      setConnectError(errorMessage);
    }
  };

  const handleRefresh = async () => {
    const success = await refreshToken();
    if (success) {
      console.log('Token refreshed successfully');
    }
  };

  const handleDebugCheck = async () => {
    console.log('🔍 Manual Slack auth status check...');
    try {
      const status = await apiClient.getSlackAuthStatus(tenantId);
      console.log('📊 Manual Slack Auth Status:', status);
    } catch (err) {
      console.error('❌ Manual Slack Auth Status Error:', err);
    }
  };

  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh of Slack auth status...');
    await checkAuth();
  };

  const handleCleanupDuplicates = async () => {
    console.log('🧹 Cleaning up duplicate Slack integrations...');
    try {
      const result = await apiClient.cleanupDuplicateSlackIntegrations(tenantId);
      console.log('✅ Cleanup result:', result);
      if (result.success) {
        // Refresh auth status after cleanup
        await checkAuth();
      }
    } catch (err) {
      console.error('❌ Cleanup failed:', err);
    }
  };

  const handleDisconnect = async () => {
    const shouldDisconnect = window.confirm(
      'Are you sure you want to disconnect Slack? This will remove all Slack integrations for this tenant.'
    );
    
    if (shouldDisconnect) {
      try {
        setConnecting(true);
        await apiClient.disconnectSlack(tenantId);
        await checkAuth(); // Refresh status
      } catch (err) {
        console.error('Failed to disconnect Slack:', err);
      } finally {
        setConnecting(false);
      }
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
            <span>Checking Slack connection...</span>
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

  // Show cleanup option if there are duplicate integrations
  if (authStatus?.message?.includes('Multiple Slack integrations found')) {
    return (
      <div className="card mt-4">
        <div className="card-header bg-warning-subtle">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Slack Integration</h3>
            <span className="text-warning fw-bold">⚠️ Duplicate Integrations</span>
          </div>
        </div>
        <div className="card-body">
          <div className="alert alert-warning">
            <strong>Multiple Slack integrations detected!</strong><br />
            {authStatus.message}
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="text-muted mb-0">
                Click the button below to clean up duplicate integrations and restore your connection.
              </p>
            </div>
            <div>
              <button 
                className="btn btn-warning me-2" 
                onClick={handleCleanupDuplicates}
                disabled={loading}
              >
                {loading ? 'Cleaning...' : '🧹 Clean Up Duplicates'}
              </button>
              <button 
                className="btn btn-outline-secondary btn-sm" 
                onClick={handleDebugCheck}
              >
                Debug Status
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authStatus?.authenticated) {
    return (
      <div className="card mt-4">
        <div className="card-header bg-success-subtle">
          <div className="d-flex justify-content-between align-items-center w-100">
            <h3 className="mb-0">Slack Integration</h3>
            <div className="d-flex align-items-center ms-auto">
              {polling && (
                <div className="spinner-border spinner-border-sm text-success me-2" role="status">
                  <span className="visually-hidden">Refreshing...</span>
                </div>
              )}
              <span className="text-success fw-bold">Connected ✔</span>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              {authStatus.team && (
                <div className="mb-2">
                  <strong>Workspace:</strong> {authStatus.team}
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
                className="btn btn-outline-danger btn-sm" 
                onClick={handleDisconnect}
                disabled={connecting || loading}
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show expired token case
  if (authStatus?.message?.includes('Token expired') && !authStatus?.can_refresh) {
    return (
      <div className="card mt-4">
        <div className="card-header bg-danger-subtle">
          <div className="d-flex justify-content-between align-items-center">
            <h3>Slack Integration</h3>
            <span className="text-danger fw-bold">❌ Token Expired</span>
          </div>
        </div>
        <div className="card-body">
          <div className="alert alert-warning">
            <strong>Slack connection needs to be renewed.</strong><br />
            Please disconnect and reconnect to restore the integration.
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="text-muted mb-0">
                Your Slack connection has expired and needs to be renewed.
              </p>
            </div>
            <div>
              <button 
                className="btn btn-danger" 
                onClick={handleDisconnect}
                disabled={connecting || loading}
              >
                Disconnect & Reconnect
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
            <h3>Slack Integration</h3>
            <span className="text-warning fw-bold">⚠️ Token Expired</span>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <p className="text-muted mb-0">
                Your Slack token has expired, but it can be refreshed automatically.
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
          <h3>Slack Integration</h3>
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
        {connectError && (
          <div className="alert alert-danger mb-3">
            <strong>Connection Failed:</strong> Unable to connect to Slack at this time.
            <br />
            <small className="text-muted">
              Please try again in a few moments or contact support if the issue persists.
            </small>
          </div>
        )}
        <div className="row">
          <div className="col-md-8">
            <p className="text-muted mb-0">
              Connect your Slack workspace to sync messages and channels.
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
              {connecting ? 'Connecting...' : 'Connect to Slack'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlackConnectCard;
