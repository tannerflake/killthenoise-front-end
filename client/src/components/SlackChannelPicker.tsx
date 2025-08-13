import React, { useState, useEffect } from 'react';
import { Button } from './ui';
import { apiClient } from '../lib/api';

interface SlackChannel {
  id: string;
  name: string;
  selected: boolean;
}

interface SlackChannelPickerProps {
  tenantId: string;
  onChannelsUpdated: (selectedChannels: string[]) => void;
  onSyncComplete: (ingestedCount: number) => void;
  onError: (error: string) => void;
}

const SlackChannelPicker: React.FC<SlackChannelPickerProps> = ({
  tenantId,
  onChannelsUpdated,
  onSyncComplete,
  onError
}) => {
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<number | null>(null);

  useEffect(() => {
    loadChannels();
  }, [tenantId]);

  const loadChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔵 Loading Slack channels for tenant:', tenantId);
      const response = await apiClient.listSlackChannels(tenantId);
      console.log('🟢 Slack channels response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Channels loaded successfully:', response.data);
        setChannels(response.data);
      } else if (response.success && (response as any).channels) {
        // Handle case where channels are at root level
        console.log('✅ Channels loaded (root level):', (response as any).channels);
        setChannels((response as any).channels);
      } else {
        console.log('❌ Failed to load channels - response:', response);
        throw new Error(response.message || 'Failed to load channels');
      }
    } catch (err: any) {
      console.log('🔴 Channel loading error:', err);
      console.log('🔴 Error details:', { message: err?.message, response: err?.response?.data });
      const errorMessage = err?.message || 'Failed to load Slack channels';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelToggle = (channelId: string) => {
    setChannels(prev => 
      prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, selected: !channel.selected }
          : channel
      )
    );
  };

  const handleSaveChannels = async () => {
    const selectedChannelIds = channels.filter(c => c.selected).map(c => c.id);
    
    if (selectedChannelIds.length === 0) {
      setError('Please select at least one channel');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const response = await apiClient.updateSlackChannels(tenantId, selectedChannelIds);
      
      if (response.success) {
        onChannelsUpdated(selectedChannelIds);
        setError(null);
      } else {
        throw new Error(response.message || 'Failed to save channels');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to save channel selection';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setLastSyncResult(null);
      console.log('🔵 Starting Slack sync for tenant:', tenantId);
      
      const response = await apiClient.syncSlack(tenantId, 7);
      console.log('🟢 Slack sync response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Sync successful (data property) - ingested:', response.data.ingested);
        setLastSyncResult(response.data.ingested);
        onSyncComplete(response.data.ingested);
      } else if (response.success && (response as any).ingested !== undefined) {
        // Handle case where ingested is at root level
        console.log('✅ Sync successful (root level) - ingested:', (response as any).ingested);
        setLastSyncResult((response as any).ingested);
        onSyncComplete((response as any).ingested);
      } else {
        console.log('❌ Sync failed - response:', response);
        throw new Error(response.message || 'Sync failed');
      }
    } catch (err: any) {
      console.log('🔴 Slack sync error:', err);
      console.log('🔴 Sync error details:', { message: err?.message, response: err?.response?.data });
      const errorMessage = err?.message || 'Failed to sync Slack messages';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setSyncing(false);
    }
  };

  const selectedCount = channels.filter(c => c.selected).length;

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-4">
          <div className="mb-2">⏳</div>
          <div>Loading Slack channels...</div>
        </div>
      </div>
    );
  }

  if (error && channels.length === 0) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-danger">
            {error}
          </div>
          <Button onClick={loadChannels}>
            🔄 Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="mb-0">
          <span className="me-2">📋</span>
          Select Slack Channels
        </h3>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger mb-3">
            {error}
          </div>
        )}

        {lastSyncResult !== null && (
          <div className="alert alert-success mb-3">
            ✅ Sync completed! Ingested {lastSyncResult} messages from the last 7 days.
          </div>
        )}

        <div className="mb-3">
          <p className="text-muted">
            Select the channels you want to sync for issue detection. 
            Messages from selected channels will be analyzed for customer issues and bugs.
          </p>
        </div>

        {channels.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-muted">
              No channels found. Make sure your Slack app has the required permissions.
            </div>
          </div>
        ) : (
          <>
            <div className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {channels.map(channel => (
                <div key={channel.id} className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`channel-${channel.id}`}
                    checked={channel.selected}
                    onChange={() => handleChannelToggle(channel.id)}
                    disabled={saving || syncing}
                  />
                  <label 
                    className="form-check-label" 
                    htmlFor={`channel-${channel.id}`}
                    style={{ fontSize: '14px' }}
                  >
                    <span className="me-1">#</span>
                    {channel.name}
                  </label>
                </div>
              ))}
            </div>

            <div className="d-flex gap-2 align-items-center">
              <Button
                onClick={handleSaveChannels}
                disabled={saving || syncing || selectedCount === 0}
                style={{ 
                  backgroundColor: 'var(--primary-color)', 
                  borderColor: 'var(--primary-color)' 
                }}
              >
                {saving ? (
                  <>⏳ Saving...</>
                ) : (
                  <>💾 Save Selection ({selectedCount})</>
                )}
              </Button>

              {selectedCount > 0 && (
                <Button
                  onClick={handleSync}
                  disabled={saving || syncing}
                  style={{ 
                    backgroundColor: 'var(--secondary-color)', 
                    borderColor: 'var(--secondary-color)' 
                  }}
                >
                  {syncing ? (
                    <>⏳ Syncing...</>
                  ) : (
                    <>🔄 Sync Last 7 Days</>
                  )}
                </Button>
              )}
            </div>
          </>
        )}

        <div className="mt-3 p-3 bg-light rounded small">
          <strong>💡 Tip:</strong> Select channels like #customer-support, #bug-reports, 
          or #internal-feedback for best results. Avoid high-volume general channels.
        </div>
      </div>
    </div>
  );
};

export default SlackChannelPicker;