import React from 'react';
import { Badge } from './ui';

interface Issue {
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

interface IssueTableProps {
  issues: Issue[];
}

const IssueTable: React.FC<IssueTableProps> = ({ issues }) => {
  const getSeverityBadge = (severity: number) => {
    if (severity >= 4) return <Badge variant="destructive">Critical</Badge>;
    if (severity >= 3) return <Badge className="bg-yellow-500 hover:bg-yellow-600">High</Badge>;
    if (severity >= 2) return <Badge className="bg-blue-500 hover:bg-blue-600">Medium</Badge>;
    return <Badge className="bg-green-500 hover:bg-green-600">Low</Badge>;
  };

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'slack': return '💬';
      case 'hubspot': return '📊';
      case 'jira': return '🎫';
      case 'google_docs': return '📄';
      default: return '📋';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'bug': return <Badge variant="destructive">🐛</Badge>;
      case 'feature': return <Badge>✨</Badge>;
      default: return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getJiraStatusBadge = (issue: Issue) => {
    if (!issue.jira_exists) {
      return <Badge variant="secondary">❌</Badge>;
    }
    
    if (!issue.jira_status) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">❓</Badge>;
    }

    switch (issue.jira_status.toLowerCase()) {
      case 'done':
      case 'closed':
        return <Badge className="bg-green-500 hover:bg-green-600">✅</Badge>;
      case 'in progress':
        return <Badge className="bg-blue-500 hover:bg-blue-600">🔄</Badge>;
      case 'to do':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">📋</Badge>;
      case 'backlog':
        return <Badge variant="secondary">📚</Badge>;
      default:
        return <Badge variant="secondary">{issue.jira_status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (issues.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-secondary">No issues found. Run an integration test to populate data.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Issue</th>
            <th>Type</th>
            <th>
              <div className="d-flex flex-column align-center">
                <span>Jira</span>
                <span className="text-xs text-secondary" title="❌ No Jira ticket | ✅ Done | 🔄 In Progress | 📋 To Do | 📚 Backlog">?</span>
              </div>
            </th>
            <th>Source</th>
            <th>Severity</th>
            <th>Frequency</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id}>
              <td>
                <div>
                  <strong>{issue.title}</strong>
                  {issue.description && (
                    <p className="text-secondary text-sm mb-0">
                      {issue.description.length > 100 
                        ? `${issue.description.substring(0, 100)}...` 
                        : issue.description}
                    </p>
                  )}
                </div>
              </td>
              <td>
                {getTypeBadge(issue.type)}
              </td>
              <td>
                <div className="d-flex flex-column align-center">
                  {getJiraStatusBadge(issue)}
                  {issue.jira_exists && issue.jira_issue_key && (
                    <span className="text-xs text-secondary mt-1">
                      {issue.jira_issue_key}
                    </span>
                  )}
                </div>
              </td>
              <td>
                <div className="d-flex align-center">
                  <span className="mr-2">{getSourceIcon(issue.source)}</span>
                  <span className="text-capitalize">{issue.source.replace('_', ' ')}</span>
                </div>
              </td>
              <td>
                {getSeverityBadge(issue.severity)}
              </td>
              <td>
                <strong>{issue.frequency}</strong>
                <span className="text-secondary text-sm"> reports</span>
              </td>
              <td>
                <Badge className={issue.status === 'open' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}>
                  {issue.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IssueTable; 