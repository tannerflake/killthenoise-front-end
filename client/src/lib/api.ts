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

export interface JiraStatus {
  connected: boolean;
  user?: {
    account_id: string;
    display_name: string;
    email: string;
  };
  base_url?: string;
  error?: string;
}

export interface JiraIntegration {
  id: string;
  tenant_id: string;
  is_active: boolean;
  last_synced_at?: string;
  last_sync_status?: string;
  sync_error_message?: string;
  created_at: string;
  updated_at: string;
  connection_status: JiraStatus;
}

export interface JiraIssue {
  id: string;
  summary: string;
  status: string;
  priority: string;
  assignee?: string;
  issue_type: string;
  project: string;
  created: string;
  updated: string;
  url: string;
  description?: string;
  reporter?: string;
}

export interface JiraProject {
  key: string;
  name: string;
  id: string;
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

export interface AiIssueSourceBreakdown {
  source: string; // e.g., 'hubspot', 'jira', 'slack'
  count: number;
}

export interface AiIssueGroup {
  id: string;
  tenant_id: string;
  title: string;
  summary: string;
  severity?: number | null;
  status?: string | null;
  tags?: string[];
  frequency: number;
  sources: AiIssueSourceBreakdown[]; // aggregated counts by source
  updated_at: string;
}

export interface AiIssueReportItem {
  id: string;
  group_id: string;
  source: string; // hubspot | jira | slack | etc
  title: string;
  url?: string | null;
  external_id?: string | null;
  created_at: string;
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

  // AI Issues API
  async listAiIssues(tenantId: string, limit: number = 20): Promise<ApiResponse<AiIssueGroup[]>> {
    const response = await api.get<ApiResponse<AiIssueGroup[]>>(`/api/issues/ai?tenant_id=${tenantId}&limit=${limit}`);
    return response.data;
  },

  async getAiIssueReports(groupId: string): Promise<ApiResponse<AiIssueReportItem[]>> {
    const response = await api.get<ApiResponse<AiIssueReportItem[]>>(`/api/issues/ai/${groupId}/reports`);
    return response.data;
  },

  async reclusterAiIssues(tenantId: string): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>(`/api/issues/ai/recluster/${tenantId}`);
    return response.data;
  },

  async createJiraTicketFromAiIssue(aiIssueId: string, ticketData: { title: string; description: string }): Promise<ApiResponse<{ ticket_key: string; ticket_url: string }>> {
    const tenantId = localStorage.getItem('tenantId') || 'demo-tenant';
    const response = await api.post<ApiResponse<{ ticket_key: string; ticket_url: string }>>(`/api/issues/ai/${aiIssueId}/create-jira-ticket?tenant_id=${tenantId}`, ticketData);
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

  async listJiraIntegrations(tenantId: string): Promise<ApiResponse<JiraIntegration[]>> {
    const response = await api.get<ApiResponse<JiraIntegration[]>>(`/api/jira/integrations/${tenantId}`);
    return response.data;
  },

  async createJiraIntegration(tenantId: string, credentials: { access_token: string; base_url: string; email: string }): Promise<{success: boolean, integration_id?: string, tenant_id?: string, message?: string, detail?: any}> {
    const response = await api.post<{success: boolean, integration_id?: string, tenant_id?: string, message?: string, detail?: any}>(`/api/jira/integrations/${tenantId}`, credentials);
    return response.data;
  },

  async getJiraStatus(tenantId: string, integrationId: string): Promise<JiraStatus> {
    const response = await api.get<JiraStatus>(`/api/jira/status/${tenantId}/${integrationId}`);
    return response.data;
  },

  async listJiraIssues(tenantId: string, integrationId: string, limit?: number, jql?: string): Promise<{success: boolean, issues: JiraIssue[], total: number, max_results: number}> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (jql) params.append('jql', jql);
    
    const response = await api.get<{success: boolean, issues: JiraIssue[], total: number, max_results: number}>(`/api/jira/issues/${tenantId}/${integrationId}?${params}`);
    return response.data;
  },

  async getJiraIssue(tenantId: string, integrationId: string, issueKey: string): Promise<{success: boolean, issue: JiraIssue}> {
    const response = await api.get<{success: boolean, issue: JiraIssue}>(`/api/jira/issues/${tenantId}/${integrationId}/${issueKey}`);
    return response.data;
  },

  async createJiraIssue(tenantId: string, integrationId: string, projectKey: string, summary: string, description: string, issueType: string): Promise<{success: boolean, issue_key: string, issue_id: string, url: string}> {
    const response = await api.post<{success: boolean, issue_key: string, issue_id: string, url: string}>(`/api/jira/issues/${tenantId}/${integrationId}`, {
      project_key: projectKey,
      summary: summary,
      description: description,
      issue_type: issueType
    });
    return response.data;
  },

  async updateJiraIssue(tenantId: string, integrationId: string, issueKey: string, updates: any): Promise<{success: boolean}> {
    const response = await api.put<{success: boolean}>(`/api/jira/issues/${tenantId}/${integrationId}/${issueKey}`, updates);
    return response.data;
  },

  async listJiraProjects(tenantId: string, integrationId: string): Promise<{success: boolean, projects: JiraProject[]}> {
    const response = await api.get<{success: boolean, projects: JiraProject[]}>(`/api/jira/projects/${tenantId}/${integrationId}`);
    return response.data;
  },

  async syncJira(tenantId: string, integrationId: string, syncType: 'full' | 'incremental' = 'full'): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>(`/api/jira/sync/${tenantId}/${integrationId}?sync_type=${syncType}`);
    return response.data;
  },

  // Analytics API
  async getAnalytics(data: any): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/api/analytics/analyze', data);
    return response.data;
  }
}; 