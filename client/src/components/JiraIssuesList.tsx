import React, { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

interface JiraIssue {
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
}

interface JiraIssuesListProps {
  tenantId: string;
  integrationId: string;
}

export const JiraIssuesList: React.FC<JiraIssuesListProps> = ({
  tenantId,
  integrationId
}) => {
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  const fetchIssues = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.listJiraIssues(tenantId, integrationId);

      if (response.success) {
        setIssues(response.issues || []);
        setTotal(response.total || 0);
      } else {
        setError('Failed to fetch issues');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [tenantId, integrationId]);

  const getIssueIcon = (issueType: string) => {
    switch (issueType.toLowerCase()) {
      case 'bug':
        return '🐛';
      case 'story':
        return '📖';
      case 'task':
        return '📋';
      case 'epic':
        return '📚';
      default:
        return '📄';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'highest':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="jira-issues-card">
        <div className="card-body">
          <div className="loading-spinner">
            <p>Loading issues...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="jira-issues-card">
        <div className="card-body">
          <div className="alert alert-danger">
            Error: {error}
          </div>
          <button onClick={fetchIssues} className="btn btn-outline-secondary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="jira-issues-card">
      <div className="card-body">
        <h4>Jira Issues ({total})</h4>

        {issues.length === 0 ? (
          <p className="text-muted">No issues found</p>
        ) : (
          <div className="issues-list">
            {issues.map((issue) => (
              <div key={issue.id} className="issue-item">
                <div className="issue-header">
                  <span className="issue-icon">
                    {getIssueIcon(issue.issue_type)}
                  </span>
                  <span className="issue-id">{issue.id}</span>
                  <span className="issue-summary">{issue.summary}</span>
                </div>
                
                <div className="issue-details">
                  <span className="issue-project">{issue.project}</span>
                  <span className="issue-status">{issue.status}</span>
                  {issue.assignee && (
                    <span className="issue-assignee">Assignee: {issue.assignee}</span>
                  )}
                  <span className="issue-updated">
                    Updated: {new Date(issue.updated).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="issue-actions">
                  {issue.priority && (
                    <span className={`badge badge-${getPriorityColor(issue.priority)}`}>
                      {issue.priority}
                    </span>
                  )}
                  <span className="badge badge-outline">{issue.issue_type}</span>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => window.open(issue.url, '_blank')}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={fetchIssues}
          className="btn btn-outline-secondary"
        >
          Refresh Issues
        </button>
      </div>
    </div>
  );
}; 