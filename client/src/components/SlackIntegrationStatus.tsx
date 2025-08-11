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

  useEffect(() => {
    checkStatus();
  }, [tenantId]);

  const checkStatus = async () => {
    try {
      setStatus('loading');
      setError(null);
      
      // Try to list channels to check if integration exists and is working
      const response = await apiClient.listSlackChannels(tenantId);
      
      if (response.success && response.data) {
        setStatus('connected');
        setChannelCount(response.data.filter(c => c.selected).length);
      } else {
        setStatus('error');
        setError(response.message || 'Failed to check Slack status');
      }
    } catch (err: any) {
      if (err?.message?.includes('404') || err?.message?.includes('not found')) {
        setStatus('not_found');
      } else {
        setStatus('error');
        setError(err?.message || 'Failed to check Slack connection');
      }
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
        return `Connected • ${channelCount} channels selected`;
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