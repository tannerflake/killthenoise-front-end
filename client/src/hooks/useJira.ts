import { useState, useCallback } from 'react';
import { apiClient, JiraStatus, JiraIssue, JiraIntegration, JiraProject } from '../lib/api';

export const useJira = (tenantId: string, integrationId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatus = async (): Promise<JiraStatus> => {
    try {
      setLoading(true);
      setError(null);
      return await apiClient.getJiraStatus(tenantId, integrationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get Jira status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const listIntegrations = useCallback(async (): Promise<JiraIntegration[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.listJiraIntegrations(tenantId);
      return response.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list Jira integrations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const createIntegration = async (accessToken: string, baseUrl: string, email: string) => {
    try {
      setLoading(true);
      setError(null);
      return await apiClient.createJiraIntegration(tenantId, { access_token: accessToken, base_url: baseUrl, email });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create Jira integration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const listIssues = async (limit?: number, jql?: string): Promise<JiraIssue[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.listJiraIssues(tenantId, integrationId, limit, jql);
      return response.issues || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list Jira issues');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getIssue = async (issueKey: string): Promise<JiraIssue> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getJiraIssue(tenantId, integrationId, issueKey);
      return response.issue;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get Jira issue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createIssue = async (projectKey: string, summary: string, description: string, issueType: string) => {
    try {
      setLoading(true);
      setError(null);
      return await apiClient.createJiraIssue(tenantId, integrationId, projectKey, summary, description, issueType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create Jira issue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateIssue = async (issueKey: string, updates: any) => {
    try {
      setLoading(true);
      setError(null);
      return await apiClient.updateJiraIssue(tenantId, integrationId, issueKey, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update Jira issue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const listProjects = async (): Promise<JiraProject[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.listJiraProjects(tenantId, integrationId);
      return response.projects || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list Jira projects');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const syncIssues = async (syncType: 'full' | 'incremental' = 'full') => {
    try {
      setLoading(true);
      setError(null);
      return await apiClient.syncJira(tenantId, integrationId, syncType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync Jira issues');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getStatus,
    listIntegrations,
    createIntegration,
    listIssues,
    getIssue,
    createIssue,
    updateIssue,
    listProjects,
    syncIssues,
    loading,
    error,
  };
}; 