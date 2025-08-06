import axios, { AxiosResponse } from 'axios';

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

export interface HubSpotStatus {
  connected: boolean;
  last_sync?: string;
  integration_id?: string;
}

export interface HubSpotTicket {
  id: string;
  properties: {
    subject: string;
    content: string;
    hs_ticket_priority: string;
    createdate: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface TransformedHubSpotTicket {
  id: string;
  title: string;
  description: string;
  created_at: string;
  severity: number;
  source: string;
}

export interface Issue {
  id: number;
  title: string;
  description?: string;
  source: string;
  severity: number;
  frequency: number;
  status: string;
  type: 'bug' | 'feature';
  tags?: string[];
  jira_issue_key?: string;
  jira_status?: string;
  jira_exists: boolean;
  created_at: string;
  updated_at: string;
}

// Create API client
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || 'http://localhost:8000',
  withCredentials: true,
});

// Attach tenant header to every request
api.interceptors.request.use((config) => {
  const tenantId = localStorage.getItem('tenantId') || 'demo-tenant';
  if (!config.headers) {
    config.headers = {} as any;
  }
  (config.headers as any)['X-Tenant-ID'] = tenantId;
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API methods matching backend structure
export const apiClient = {
  // Issues API
  async getTopIssues(limit: number = 10): Promise<ApiResponse<Issue[]>> {
    const response = await api.get<ApiResponse<Issue[]>>(`/api/issues/top?limit=${limit}`);
    return response.data;
  },

  async listIssues(source?: string, limit: number = 10): Promise<ApiResponse<Issue[]>> {
    const params = new URLSearchParams();
    if (source) params.append('source', source);
    params.append('limit', limit.toString());
    
    const response = await api.get<ApiResponse<Issue[]>>(`/api/issues/?${params}`);
    return response.data;
  },

  // HubSpot API
  async getHubSpotStatus(tenantId: string, integrationId: string): Promise<HubSpotStatus> {
    const response = await api.get<HubSpotStatus>(`/api/hubspot/status/${tenantId}/${integrationId}`);
    return response.data;
  },

  async listHubSpotTickets(tenantId: string, integrationId: string, limit?: number): Promise<{success: boolean, tickets: HubSpotTicket[], total_count: number, tenant_id: string}> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await api.get<{success: boolean, tickets: HubSpotTicket[], total_count: number, tenant_id: string}>(`/api/hubspot/tickets/${tenantId}/${integrationId}${params}`);
    return response.data;
  },

  async syncHubSpot(tenantId: string, integrationId: string, syncType: 'full' | 'incremental' = 'full'): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>(`/api/hubspot/sync/${tenantId}/${integrationId}?sync_type=${syncType}`);
    return response.data;
  },

  async listHubSpotIntegrations(tenantId: string): Promise<ApiResponse<any[]>> {
    const response = await api.get<ApiResponse<any[]>>(`/api/hubspot/integrations/${tenantId}`);
    return response.data;
  },

  async createHubSpotIntegration(tenantId: string, accessToken: string): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>(`/api/hubspot/integrations/${tenantId}`, {
      access_token: accessToken
    });
    return response.data;
  },

  async getHubSpotAuthUrl(tenantId: string): Promise<{ success: boolean; authorization_url: string; integration_id: string; tenant_id: string }> {
    const response = await api.get<{ success: boolean; authorization_url: string; integration_id: string; tenant_id: string }>(`/api/hubspot/authorize/${tenantId}`);
    return response.data;
  },

  // Integrations API
  async testIntegration(): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/api/integrations/test');
    return response.data;
  },

  // Jira API
  async matchJiraIssues(): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/api/jira/match-all');
    return response.data;
  },

  // Analytics API
  async getAnalytics(data: any): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/api/analytics/analyze', data);
    return response.data;
  }
}; 