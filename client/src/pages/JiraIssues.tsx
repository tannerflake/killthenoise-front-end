import React, { useEffect, useState } from 'react';
import { useJira } from '../hooks/useJira';
import { useTenant } from '../context/TenantContext';
import { JiraIssue } from '../lib/api';
import JiraIssueModal from '../components/JiraIssueModal';

const JiraIssues: React.FC = () => {
  const { tenantId } = useTenant();
  const integrationId = localStorage.getItem('jira_integration_id') || '';
  const { listIssues, syncIssues, loading, error } = useJira(tenantId, integrationId);
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignee: '',
    search: '',
    project: '',
    issueType: ''
  });
  const [selectedIssueKey, setSelectedIssueKey] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchIssues = async () => {
    try {
      console.log('Fetching issues with integration ID:', integrationId);
      const issueData = await listIssues(50);
      console.log('Received issue data:', issueData);
      setIssues(issueData);
    } catch (err) {
      console.error('Error fetching issues:', err);
    }
  };

  const handleSync = async () => {
    try {
      await syncIssues('full');
      await fetchIssues();
      setLastSynced(new Date());
    } catch (err) {
      console.error('Error syncing issues:', err);
    }
  };

  const handleIssueClick = (issueKey: string) => {
    setSelectedIssueKey(issueKey);
    setIsModalOpen(true);
  };

  const handleCreateIssue = () => {
    setSelectedIssueKey(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedIssueKey(null);
  };

  const handleIssueUpdated = () => {
    fetchIssues();
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const filteredIssues = issues.filter(issue => {
    if (filters.status && issue.status !== filters.status) return false;
    if (filters.priority && issue.priority !== filters.priority) return false;
    if (filters.assignee && issue.assignee !== filters.assignee) return false;
    if (filters.project && issue.project !== filters.project) return false;
    if (filters.issueType && issue.issue_type !== filters.issueType) return false;
    if (filters.search && !issue.summary.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'to do':
      case 'open':
        return 'badge bg-secondary';
      case 'in progress':
        return 'badge bg-primary';
      case 'done':
      case 'closed':
        return 'badge bg-success';
      default:
        return 'badge bg-secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'highest':
        return 'text-danger';
      case 'medium':
        return 'text-warning';
      case 'low':
      case 'lowest':
        return 'text-success';
      default:
        return 'text-secondary';
    }
  };

  useEffect(() => {
    if (integrationId) {
      fetchIssues();
    }
  }, [integrationId]);

  if (!integrationId) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          <h4>No Jira Integration</h4>
          <p>Please connect your Jira instance first to view issues.</p>
          <a href="/integrations" className="btn btn-primary">Go to Integrations</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-between align-items-center mb-4">
        <h1>Jira Issues</h1>
        <div>
          <button className="btn btn-success me-2" onClick={handleCreateIssue}>
            Create Issue
          </button>
          <button className="btn btn-primary" onClick={handleSync} disabled={loading}>
            {loading ? 'Syncing...' : 'Sync Issues'}
          </button>
        </div>
      </div>

              {error && <div className="alert alert-danger mb-3">{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
      {lastSynced && (
        <p className="text-sm text-secondary mb-3">Last synced: {lastSynced.toLocaleTimeString()}</p>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-2">
              <label className="form-label">Status</label>
              <select 
                className="form-select" 
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Priority</label>
              <select 
                className="form-select" 
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Project</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Filter by project"
                value={filters.project}
                onChange={(e) => handleFilterChange('project', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Type</label>
              <select 
                className="form-select" 
                value={filters.issueType}
                onChange={(e) => handleFilterChange('issueType', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Task">Task</option>
                <option value="Bug">Bug</option>
                <option value="Story">Story</option>
                <option value="Epic">Epic</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Assignee</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Filter by assignee"
                value={filters.assignee}
                onChange={(e) => handleFilterChange('assignee', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Search</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search issues..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-12">
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setFilters({
                  status: '',
                  priority: '',
                  assignee: '',
                  search: '',
                  project: '',
                  issueType: ''
                })}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Summary</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                  <th>Type</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.length > 0 ? filteredIssues.map((issue) => (
                  <tr key={issue.id}>
                    <td>
                      <button 
                        className="btn btn-link p-0 text-decoration-none"
                        onClick={() => handleIssueClick(issue.id)}
                      >
                        {issue.id}
                      </button>
                    </td>
                    <td>
                      <div className="issue-summary">
                        <strong>{issue.summary}</strong>
                        {issue.description && (
                          <small className="text-muted d-block">
                            {issue.description.substring(0, 100)}
                            {issue.description.length > 100 && '...'}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={getStatusColor(issue.status)}>
                        {issue.status}
                      </span>
                    </td>
                    <td>
                      <span className={getPriorityColor(issue.priority)}>
                        {issue.priority}
                      </span>
                    </td>
                    <td>{issue.assignee || '-'}</td>
                    <td>
                      <span className="badge bg-info">{issue.issue_type}</span>
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(issue.updated).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleIssueClick(issue.id)}
                        >
                          View
                        </button>
                        <a 
                          href={issue.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-secondary"
                        >
                          Open in Jira
                        </a>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="text-center text-secondary py-4">
                      {issues.length === 0 ? 'No Jira issues found.' : 'No issues match the current filters.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-4 p-2 bg-light rounded">
        <small className="text-muted">
          Debug: Integration ID: {integrationId}
          <br />
          Issues count: {issues.length}
          <br />
          Filtered count: {filteredIssues.length}
        </small>
      </div>

      {/* Issue Modal */}
      <JiraIssueModal
        issueKey={selectedIssueKey}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onIssueUpdated={handleIssueUpdated}
      />
    </div>
  );
};

export default JiraIssues; 