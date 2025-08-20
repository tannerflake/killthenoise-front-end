# Frontend Integration Guide for KillTheNoise Backend

## 🚀 Quick Start

Your frontend needs to connect to the KillTheNoise backend API running at **http://localhost:8000**. This guide will help you set up the connection and implement all necessary API calls.

## 📋 Prerequisites

1. **Backend must be running** at `http://localhost:8000`
2. **Frontend should run on a different port** (e.g., `http://localhost:3000`)
3. **CORS is already configured** on the backend to allow `http://localhost:3000`

## 🔧 Backend Status Check

First, verify the backend is running:
```bash
curl http://localhost:8000/docs
```

You should see the Swagger UI documentation page.

## 📚 API Documentation

- **Interactive API Docs**: http://localhost:8000/docs
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## 🏗️ API Structure Overview

The backend provides these main API modules:

### 1. **Issues Management** (`/api/issues`)
- Get top issues by severity/frequency
- List paginated issues with filtering

### 2. **HubSpot Integration** (`/api/hubspot`)
- OAuth 2.0 authorization flow
- Ticket management and syncing
- Integration status monitoring

### 3. **Integrations Management** (`/api/integrations`)
- Test integration connections
- Manage multiple integrations

### 4. **Jira Integration** (`/api/jira`)
- Issue matching and synchronization

### 5. **Analytics** (`/api/analytics`)
- Data analysis and reporting

### 6. **Sync Operations** (`/api/sync`)
- Background synchronization tasks

### 7. **Webhooks** (`/api/webhooks`)
- External service notifications

## 🔌 Frontend Setup Instructions

### Step 1: Create API Client

Create a centralized API client for your frontend:

```typescript
// api/client.ts
const API_BASE_URL = 'http://localhost:8000';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Issues API
  async getTopIssues(limit: number = 10) {
    return this.request<{ success: boolean; data: any[]; count: number }>(
      `/api/issues/top?limit=${limit}`
    );
  }

  async listIssues(source?: string, limit: number = 10) {
    const params = new URLSearchParams();
    if (source) params.append('source', source);
    params.append('limit', limit.toString());
    
    return this.request<{ success: boolean; data: any[]; count: number }>(
      `/api/issues/?${params}`
    );
  }

  // HubSpot API
  async getHubSpotStatus(tenantId: string, integrationId: string) {
    return this.request(`/api/hubspot/status/${tenantId}/${integrationId}`);
  }

  async listHubSpotTickets(tenantId: string, integrationId: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/api/hubspot/tickets/${tenantId}/${integrationId}${params}`);
  }

  async syncHubSpot(tenantId: string, integrationId: string, syncType: 'full' | 'incremental' = 'full') {
    return this.request(`/api/hubspot/sync/${tenantId}/${integrationId}?sync_type=${syncType}`, {
      method: 'POST',
    });
  }

  async listHubSpotIntegrations(tenantId: string) {
    return this.request(`/api/hubspot/integrations/${tenantId}`);
  }

  async createHubSpotIntegration(tenantId: string, accessToken: string) {
    return this.request(`/api/hubspot/integrations/${tenantId}`, {
      method: 'POST',
      body: JSON.stringify({ access_token: accessToken }),
    });
  }

  async getHubSpotAuthUrl(tenantId: string) {
    return this.request(`/api/hubspot/authorize/${tenantId}`);
  }

  // Integrations API
  async testIntegration() {
    return this.request('/api/integrations/test', {
      method: 'POST',
    });
  }

  // Jira API
  async matchJiraIssues() {
    return this.request('/api/jira/match-all', {
      method: 'POST',
    });
  }

  // Analytics API
  async getAnalytics(data: any) {
    return this.request('/api/analytics/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
```

### Step 2: Environment Configuration

Create environment variables for your frontend:

```typescript
// config/environment.ts
export const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  frontendUrl: process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000',
};
```

### Step 3: React Hooks for API Calls

Create custom hooks for easy API integration:

```typescript
// hooks/useIssues.ts
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export const useIssues = (source?: string, limit: number = 10) => {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const response = await apiClient.listIssues(source, limit);
        setIssues(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch issues');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [source, limit]);

  return { issues, loading, error };
};

export const useTopIssues = (limit: number = 10) => {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopIssues = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getTopIssues(limit);
        setIssues(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch top issues');
      } finally {
        setLoading(false);
      }
    };

    fetchTopIssues();
  }, [limit]);

  return { issues, loading, error };
};
```

```typescript
// hooks/useHubSpot.ts
import { useState } from 'react';
import { apiClient } from '../api/client';

export const useHubSpot = (tenantId: string, integrationId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      return await apiClient.getHubSpotStatus(tenantId, integrationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get HubSpot status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const syncTickets = async (syncType: 'full' | 'incremental' = 'full') => {
    try {
      setLoading(true);
      setError(null);
      return await apiClient.syncHubSpot(tenantId, integrationId, syncType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync HubSpot tickets');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const listTickets = async (limit?: number) => {
    try {
      setLoading(true);
      setError(null);
      return await apiClient.listHubSpotTickets(tenantId, integrationId, limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list HubSpot tickets');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getStatus,
    syncTickets,
    listTickets,
    loading,
    error,
  };
};
```

### Step 4: React Components Example

```typescript
// components/IssuesList.tsx
import React from 'react';
import { useIssues } from '../hooks/useIssues';

interface IssuesListProps {
  source?: string;
  limit?: number;
}

export const IssuesList: React.FC<IssuesListProps> = ({ source, limit = 10 }) => {
  const { issues, loading, error } = useIssues(source, limit);

  if (loading) return <div>Loading issues...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Issues ({issues.length})</h2>
      {issues.length === 0 ? (
        <p>No issues found.</p>
      ) : (
        <ul>
          {issues.map((issue, index) => (
            <li key={index}>
              {/* Render your issue data here */}
              {JSON.stringify(issue)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

```typescript
// components/HubSpotIntegration.tsx
import React, { useState } from 'react';
import { useHubSpot } from '../hooks/useHubSpot';

interface HubSpotIntegrationProps {
  tenantId: string;
  integrationId: string;
}

export const HubSpotIntegration: React.FC<HubSpotIntegrationProps> = ({
  tenantId,
  integrationId,
}) => {
  const { getStatus, syncTickets, listTickets, loading, error } = useHubSpot(
    tenantId,
    integrationId
  );
  const [status, setStatus] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);

  const handleCheckStatus = async () => {
    try {
      const result = await getStatus();
      setStatus(result);
    } catch (err) {
      console.error('Failed to check status:', err);
    }
  };

  const handleSync = async (syncType: 'full' | 'incremental') => {
    try {
      const result = await syncTickets(syncType);
      alert(`Sync started: ${result.message}`);
    } catch (err) {
      console.error('Failed to sync:', err);
    }
  };

  const handleListTickets = async () => {
    try {
      const result = await listTickets(10);
      setTickets(result.data || []);
    } catch (err) {
      console.error('Failed to list tickets:', err);
    }
  };

  return (
    <div>
      <h2>HubSpot Integration</h2>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      
      <div>
        <button onClick={handleCheckStatus} disabled={loading}>
          Check Status
        </button>
        <button onClick={() => handleSync('full')} disabled={loading}>
          Full Sync
        </button>
        <button onClick={() => handleSync('incremental')} disabled={loading}>
          Incremental Sync
        </button>
        <button onClick={handleListTickets} disabled={loading}>
          List Tickets
        </button>
      </div>

      {status && (
        <div>
          <h3>Status</h3>
          <pre>{JSON.stringify(status, null, 2)}</pre>
        </div>
      )}

      {tickets.length > 0 && (
        <div>
          <h3>Tickets ({tickets.length})</h3>
          <ul>
            {tickets.map((ticket, index) => (
              <li key={index}>{JSON.stringify(ticket)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

## 🔐 Authentication & Multi-Tenancy

The backend uses a multi-tenant architecture with UUID-based tenant IDs. You'll need to:

1. **Store tenant ID** in your frontend state management
2. **Pass tenant ID** in API calls where required
3. **Handle authentication** (the backend expects tenant IDs for most operations)

```typescript
// Example tenant management
const TENANT_ID = 'your-tenant-uuid-here'; // Get this from your auth system

// Use in API calls
const { issues } = useIssues();
const { getStatus } = useHubSpot(TENANT_ID, integrationId);
```

## 🚨 Error Handling

The backend returns consistent error responses:

```typescript
// Error response format
{
  "detail": "Error message here"
}

// Success response format
{
  "success": true,
  "data": [...],
  "count": 10
}
```

## 🔄 Real-time Updates

For real-time updates, consider implementing:

1. **Polling** for status updates
2. **WebSocket connections** (if backend supports it)
3. **Server-Sent Events** for live data

## 🧪 Testing Your Integration

1. **Start the backend**: `poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
2. **Start your frontend** on a different port (e.g., 3000)
3. **Test API endpoints** using the Swagger UI at http://localhost:8000/docs
4. **Implement the frontend components** using the examples above

## 📝 Next Steps

1. **Implement the API client** in your frontend
2. **Create React hooks** for each API module
3. **Build UI components** using the hooks
4. **Add error handling** and loading states
5. **Test the integration** thoroughly
6. **Add authentication** and tenant management

## 🆘 Troubleshooting

### Common Issues:

1. **CORS errors**: Ensure frontend runs on `http://localhost:3000`
2. **Connection refused**: Verify backend is running on port 8000
3. **Authentication errors**: Check tenant ID format (must be valid UUID)
4. **API errors**: Check the Swagger docs for correct request formats

### Debug Tips:

1. **Use browser dev tools** to inspect network requests
2. **Check the backend logs** for detailed error messages
3. **Test endpoints directly** using curl or Postman
4. **Verify environment variables** are set correctly

## 📞 Support

If you encounter issues:
1. Check the backend logs for detailed error messages
2. Verify the API documentation at http://localhost:8000/docs
3. Test endpoints directly using the Swagger UI
4. Check that all required environment variables are set

---

**Happy coding! 🚀**

Your frontend should now be able to communicate with the KillTheNoise backend API successfully.