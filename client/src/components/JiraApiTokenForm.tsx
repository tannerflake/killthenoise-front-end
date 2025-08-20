import React, { useState } from 'react';
import { apiClient } from '../lib/api';

interface JiraApiTokenFormProps {
  tenantId: string;
  onSuccess: (integrationId: string) => void;
  onError: (error: string) => void;
}

export const JiraApiTokenForm: React.FC<JiraApiTokenFormProps> = ({
  tenantId,
  onSuccess,
  onError
}) => {
  const [apiToken, setApiToken] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('Form submission - Current values:', {
      apiToken: apiToken ? `${apiToken.substring(0, 5)}...` : 'empty',
      baseUrl: baseUrl || 'empty',
      email: email || 'empty',
      apiTokenLength: apiToken.length,
      baseUrlLength: baseUrl.length,
      emailLength: email.length
    });

    // Validation
    if (!apiToken.trim()) {
      console.log('Validation failed: API token is empty');
      setError('API token is required');
      setIsLoading(false);
      return;
    }

    if (!baseUrl.trim()) {
      console.log('Validation failed: Base URL is empty');
      setError('Base URL is required');
      setIsLoading(false);
      return;
    }

    if (!email.trim()) {
      console.log('Validation failed: Email is empty');
      setError('Email address is required');
      setIsLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      console.log('Validation failed: Invalid email format');
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    console.log('Validation passed - proceeding with API call');

    // Format base URL to ensure it has https:// protocol
    let formattedBaseUrl = baseUrl.trim();
    if (!formattedBaseUrl.startsWith('http://') && !formattedBaseUrl.startsWith('https://')) {
      formattedBaseUrl = `https://${formattedBaseUrl}`;
    }

    // Additional validation for API token format
    const trimmedToken = apiToken.trim();
    if (!trimmedToken.startsWith('ATATT')) {
      console.log('Warning: API token does not start with ATATT');
    }
    
    console.log('Final formatted data:', {
      base_url: formattedBaseUrl,
      token_starts_with: trimmedToken.substring(0, 5),
      token_length: trimmedToken.length
    });

    try {
      const requestData = {
        access_token: apiToken.trim(),
        base_url: formattedBaseUrl,
        email: email.trim()
      };
      
      console.log('Sending Jira integration request:', {
        tenantId,
        requestData: {
          access_token: requestData.access_token.substring(0, 10) + '...', // Log partial token for security
          base_url: requestData.base_url,
          email: requestData.email,
          access_token_length: requestData.access_token.length,
          base_url_length: requestData.base_url.length,
          email_length: requestData.email.length
        }
      });
      
      const response = await apiClient.createJiraIntegration(tenantId, requestData);

      console.log('Jira integration response:', response);
      
      if (response.success && response.integration_id) {
        onSuccess(response.integration_id);
      } else {
        // Handle backend error response
        let errorMessage = 'Failed to create integration';
        
        if (response.detail) {
          if (typeof response.detail === 'string') {
            errorMessage = response.detail;
          } else if (response.detail.error) {
            errorMessage = response.detail.error;
          } else if (response.detail.message) {
            errorMessage = response.detail.message;
          }
        } else if (response.message) {
          errorMessage = response.message;
        }
        
        console.error('Jira integration failed:', errorMessage);
        setError(errorMessage);
        onError(errorMessage);
      }
    } catch (err: any) {
      console.error('Jira integration error:', err);
      
      let errorMessage = 'Network error occurred';
      
      // Try to extract detailed error from Axios response
      if (err.response) {
        console.log('Backend error response:', err.response.data);
        const backendError = err.response.data;
        
        if (backendError.detail) {
          if (typeof backendError.detail === 'string') {
            errorMessage = backendError.detail;
          } else if (backendError.detail.error) {
            errorMessage = backendError.detail.error;
          } else if (backendError.detail.message) {
            errorMessage = backendError.detail.message;
          }
        } else if (backendError.message) {
          errorMessage = backendError.message;
        } else if (backendError.error) {
          errorMessage = backendError.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('Final error message:', errorMessage);
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="jira-api-token-form">
      <div className="form-container">
        <h3>Connect to Jira with API Token</h3>
        
        <p className="form-description">
          Get your API token from Jira {'>'} Settings {'>'} Personal Access Tokens
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="baseUrl">Jira Base URL</label>
            <input
              type="text"
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => {
                console.log('Base URL changed:', e.target.value);
                setBaseUrl(e.target.value);
              }}
              placeholder="killthenoise.atlassian.net"
              required
              className={!baseUrl.trim() && baseUrl.length > 0 ? 'error' : ''}
            />
            <small>Your Jira instance URL (e.g., killthenoise.atlassian.net)</small>
            {!baseUrl.trim() && baseUrl.length > 0 && (
              <small className="error-text">Base URL is required</small>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="apiToken">API Token</label>
            <input
              type="password"
              id="apiToken"
              value={apiToken}
              onChange={(e) => {
                console.log('API Token changed:', e.target.value ? `${e.target.value.substring(0, 5)}...` : 'empty');
                setApiToken(e.target.value);
              }}
              required
              className={!apiToken.trim() && apiToken.length > 0 ? 'error' : ''}
            />
            <small>Get this from https://id.atlassian.com/manage-profile/security/api-tokens</small>
            {!apiToken.trim() && apiToken.length > 0 && (
              <small className="error-text">API token is required</small>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                console.log('Email changed:', e.target.value);
                setEmail(e.target.value);
              }}
              placeholder="your-email@example.com"
              required
              className={!email.trim() && email.length > 0 ? 'error' : ''}
            />
            <small>Your Atlassian account email address</small>
            {!email.trim() && email.length > 0 && (
              <small className="error-text">Email address is required</small>
            )}
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !apiToken.trim() || !baseUrl.trim() || !email.trim()}
          >
            {isLoading ? 'Connecting...' : 'Connect to Jira'}
          </button>
        </form>
      </div>
    </div>
  );
}; 