import React, { useState } from 'react';
import { Button } from './ui';
import { apiClient } from '../lib/api';

interface ConnectSlackCardProps {
  tenantId: string;
  onSuccess: (integrationId: string) => void;
  onError: (error: string) => void;
}

const ConnectSlackCard: React.FC<ConnectSlackCardProps> = ({
  tenantId,
  onSuccess,
  onError
}) => {
  const [token, setToken] = useState('');
  const [team, setTeam] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidToken = (token: string): boolean => {
    return token.startsWith('xoxb-') && token.length >= 20;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidToken(token)) {
      setError('Invalid Slack bot token. Must start with "xoxb-" and be at least 20 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔵 Slack Integration Request:', { tenantId, tokenLength: token.length, team: team.trim() || undefined });
      const response = await apiClient.createSlackIntegration(tenantId, token.trim(), team.trim() || undefined);
      console.log('🟢 Slack Integration Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Success - Integration ID:', response.data.integration_id);
        onSuccess(response.data.integration_id);
        setToken('');
        setTeam('');
      } else if (response.success && (response as any).integration_id) {
        // Handle case where integration_id is at root level (backend response format)
        console.log('✅ Success (root level) - Integration ID:', (response as any).integration_id);
        onSuccess((response as any).integration_id);
        setToken('');
        setTeam('');
      } else {
        console.log('❌ Response not success or missing data:', response);
        throw new Error(response.message || 'Failed to connect Slack');
      }
    } catch (err: any) {
      console.log('🔴 Slack Integration Error:', err);
      console.log('🔴 Error details:', { message: err?.message, response: err?.response?.data });
      const errorMessage = err?.message || 'Failed to connect to Slack';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="mb-0">
          <span className="me-2">💬</span>
          Connect Slack
        </h3>
      </div>
      <div className="card-body">
        {error && (
          <div 
            className="alert alert-danger mb-3"
            style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '12px', 
              borderRadius: '4px',
              border: '1px solid #f5c6cb'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              Slack Bot Token <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              className="form-control"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="xoxb-your-bot-token-here"
              required
              disabled={loading}
              style={{
                fontFamily: 'monospace',
                fontSize: '14px'
              }}
            />
            <div className="form-text">
              <strong>Need a token?</strong> Follow the setup guide below or{' '}
              <a 
                href="https://api.slack.com/apps" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary"
              >
                create a Slack app
              </a>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">
              Team/Workspace Name <span className="text-muted">(optional)</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="your-workspace-name"
              disabled={loading}
            />
            <div className="form-text">
              Optional: This is your Slack workspace name (like "KillTheNoise.ai" or "YourCompany"). 
              You can find it in the top-left of Slack or just leave this blank.
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !isValidToken(token)}
            style={{ 
              backgroundColor: 'var(--primary-color)', 
              borderColor: 'var(--primary-color)' 
            }}
          >
            {loading ? (
              <>
                <span style={{ marginRight: '8px' }}>⏳</span>
                Connecting...
              </>
            ) : (
              <>
                💬 Connect Slack
              </>
            )}
          </Button>
        </form>

        <div className="mt-3 p-3 bg-light rounded">
          <h6 className="mb-3">🚀 Quick Setup Guide</h6>
          
          <div className="mb-3">
            <strong className="d-block mb-2">Step 1: Create Your Slack App</strong>
            <div className="small mb-2">
              • Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-primary">api.slack.com/apps</a><br/>
              • Click <strong>"Create New App"</strong> → <strong>"From scratch"</strong><br/>
              • Name it "KillTheNoise Integration" and select your workspace
            </div>
          </div>

          <div className="mb-3">
            <strong className="d-block mb-2">Step 2: Add Permissions</strong>
            <div className="small mb-2">
              • Go to <strong>"OAuth & Permissions"</strong> in the left sidebar<br/>
              • Under <strong>"Bot Token Scopes"</strong>, add these permissions:<br/>
              &nbsp;&nbsp;→ <code>channels:read</code> (view public channels)<br/>
              &nbsp;&nbsp;→ <code>channels:history</code> (read public messages)<br/>
              &nbsp;&nbsp;→ <code>groups:read</code> (view private channels, optional)<br/>
              &nbsp;&nbsp;→ <code>groups:history</code> (read private messages, optional)
            </div>
          </div>

          <div className="mb-3">
            <strong className="d-block mb-2">Step 3: Install & Get Token</strong>
            <div className="small mb-2">
              • Click <strong>"Install to KillTheNoise.ai"</strong> (blue button in OAuth Tokens section)<br/>
              • Slack will ask you to authorize → Click <strong>"Allow"</strong><br/>
              • After installation, you'll see <strong>"Bot User OAuth Token"</strong> on this page<br/>
              • Copy the token (starts with <code>xoxb-</code>) and paste it above ⬆️
            </div>
          </div>

          <div className="alert alert-info small mb-0">
            <strong>💡 Pro tip:</strong> This is a one-time setup per workspace. The token allows KillTheNoise to read messages from channels you select for issue analysis.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectSlackCard;