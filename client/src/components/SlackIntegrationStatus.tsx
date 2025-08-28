import React, { useState, useEffect } from 'react';
import { Button } from './ui';
import { apiClient } from '../lib/api';

interface SlackIntegrationStatusProps {
  tenantId: string;
  onRefresh?: () => void;
}

const SlackIntegrationStatus: React.FC<SlackIntegrationStatusProps> = ({
  tenantId,
  onRefresh
}) => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error' | 'not_found'>('loading');
  const [channelCount, setChannelCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    checkStatus();
    
    // Set up periodic status check every 30 seconds to keep status current
    const interval = setInterval(() => {
      checkStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [tenantId]);

  const checkStatus = async () => {
    try {
      setStatus('loading');
      setError(null);
      
      console.log('🔍 Checking Slack auth status for tenant:', tenantId);
      
      // Use the auth status endpoint to check if Slack is connected
      const authStatus = await apiClient.getSlackAuthStatus(tenantId);
      
      console.log('📊 Slack Auth Status Response:', authStatus);
      
      if (authStatus.authenticated) {
        console.log('✅ Slack is authenticated, setting status to connected');
        setStatus('connected');
        // Try to get channel count if authenticated
        try {
          const channelsResponse = await apiClient.listSlackChannels(tenantId);
          if (channelsResponse.success && channelsResponse.data) {
            setChannelCount(channelsResponse.data.filter(c => c.selected).length);
          }
        } catch (channelErr) {
          // Channel count is optional, don't fail the status check
          console.warn('Could not fetch channel count:', channelErr);
        }
      } else if (authStatus.needs_auth) {
        console.log('⚠️ Slack needs auth, setting status to not_found');
        setStatus('not_found');
      } else {
        console.log('❌ Slack not authenticated, setting status to error');
        setStatus('error');
        setError(authStatus.message || 'Slack not properly authenticated');
      }
      
      setLastChecked(new Date());
    } catch (err: any) {
      console.error('🚨 Error checking Slack status:', err);
      
      // Fallback: try to check connection via channels endpoint
      try {
        console.log('🔄 Trying fallback connection check via channels endpoint...');
        const channelsResponse = await apiClient.listSlackChannels(tenantId);
        if (channelsResponse.success) {
          console.log('✅ Fallback successful - Slack is connected via channels endpoint');
          setStatus('connected');
          if (channelsResponse.data) {
            setChannelCount(channelsResponse.data.filter(c => c.selected).length);
          }
        } else {
          setStatus('not_found');
        }
      } catch (fallbackErr: any) {
        console.error('🚨 Fallback also failed:', fallbackErr);
        if (err?.message?.includes('404') || err?.message?.includes('not found')) {
          setStatus('not_found');
        } else {
          setStatus('error');
          setError(err?.message || 'Failed to check Slack connection');
        }
      }
      
      setLastChecked(new Date());
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkStatus();
    onRefresh?.();
    setRefreshing(false);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return '⏳';
      case 'connected':
        return '✅';
      case 'error':
        return '❌';
      case 'not_found':
        return '⚪';
      default:
        return '❓';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'loading':
        return 'Checking connection...';
      case 'connected':
        return channelCount > 0 ? `Connected • ${channelCount} channels selected` : 'Connected';
      case 'error':
        return 'Connection error';
      case 'not_found':
        return 'Not connected';
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-success';
      case 'error':
        return 'text-danger';
      case 'not_found':
        return 'text-muted';
      default:
        return 'text-muted';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="mb-0">
            <span className="me-2">💬</span>
            Slack Integration Status
          </h3>
          <Button
            onClick={handleRefresh}
            disabled={refreshing || status === 'loading'}
            variant="outline"
            size="sm"
          >
            {refreshing ? '⏳' : '🔄'} Refresh
          </Button>
        </div>
      </div>
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <span className="me-2" style={{ fontSize: '1.5rem' }}>
            {getStatusIcon()}
          </span>
          <div>
            <div className={`fw-semibold ${getStatusColor()}`}>
              {getStatusText()}
            </div>
            {error && (
              <div className="text-danger small mt-1">
                {error}
              </div>
            )}
          </div>
        </div>

        {status === 'connected' && (
          <div className="row">
            <div className="col-md-6">
              <div className="small text-muted mb-1">Integration Type</div>
              <div className="fw-semibold">Slack Bot Token</div>
            </div>
            <div className="col-md-6">
              <div className="small text-muted mb-1">Selected Channels</div>
              <div className="fw-semibold">{channelCount} channels</div>
            </div>
          </div>
        )}
        
        {lastChecked && (
          <div className="mt-2">
            <small className="text-muted">
              Last checked: {lastChecked.toLocaleTimeString()}
            </small>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-3">
            <div className="alert alert-warning">
              <strong>⚠️ Connection Issues</strong><br />
              Your Slack integration may have expired or lost permissions. 
              Try reconnecting or check your bot token.
            </div>
          </div>
        )}

        {status === 'not_found' && (
          <div className="mt-3">
            <div className="alert alert-info">
              <strong>ℹ️ No Integration Found</strong><br />
              Use the connect form above to set up your Slack integration.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlackIntegrationStatus;