import React, { useState, useEffect } from 'react';
import { useJira } from '../hooks/useJira';
import { useTenant } from '../context/TenantContext';
import { JiraIssue, JiraProject } from '../lib/api';

interface JiraIssueModalProps {
  issueKey: string | null;
  isOpen: boolean;
  onClose: () => void;
  onIssueUpdated?: () => void;
}

const JiraIssueModal: React.FC<JiraIssueModalProps> = ({ 
  issueKey, 
  isOpen, 
  onClose, 
  onIssueUpdated 
}) => {
  const { tenantId } = useTenant();
  const integrationId = localStorage.getItem('jira_integration_id') || '';
  const { getIssue, updateIssue, listProjects, createIssue } = useJira(tenantId, integrationId);
  
  const [issue, setIssue] = useState<JiraIssue | null>(null);
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    projectKey: '',
    issueType: 'Task'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && issueKey) {
      fetchIssue();
    } else if (isOpen && !issueKey) {
      setIsCreating(true);
      fetchProjects();
    }
  }, [isOpen, issueKey]);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      const issueData = await getIssue(issueKey!);
      setIssue(issueData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error fetching issue:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const projectsData = await listProjects();
      setProjects(projectsData);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (isCreating) {
        await createIssue(
          formData.projectKey,
          formData.summary,
          formData.description,
          formData.issueType
        );
        onIssueUpdated?.();
        onClose();
      } else if (issue) {
        await updateIssue(issue.id, {
          summary: formData.summary,
          description: formData.description
        });
        await fetchIssue();
        onIssueUpdated?.();
      }
    } catch (err) {
      console.error('Error saving issue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (issue) {
      setFormData({
        summary: issue.summary,
        description: issue.description || '',
        projectKey: '',
        issueType: issue.issue_type
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setFormData({
      summary: '',
      description: '',
      projectKey: '',
      issueType: 'Task'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {isCreating ? 'Create New Issue' : issue ? `Issue: ${issue.id}` : 'Loading...'}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleCancel}
            ></button>
          </div>
          
          <div className="modal-body">
            {loading && !issue && !isCreating ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : isCreating ? (
              <div className="create-issue-form">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">Project</label>
                      <select 
                        className="form-select"
                        value={formData.projectKey}
                        onChange={(e) => handleFormChange('projectKey', e.target.value)}
                        required
                      >
                        <option value="">Select Project</option>
                        {projects.map(project => (
                          <option key={project.key} value={project.key}>
                            {project.name} ({project.key})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">Issue Type</label>
                      <select 
                        className="form-select"
                        value={formData.issueType}
                        onChange={(e) => handleFormChange('issueType', e.target.value)}
                      >
                        <option value="Task">Task</option>
                        <option value="Bug">Bug</option>
                        <option value="Story">Story</option>
                        <option value="Epic">Epic</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Summary</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={formData.summary}
                    onChange={(e) => handleFormChange('summary', e.target.value)}
                    placeholder="Enter issue summary"
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-control"
                    rows={5}
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Enter issue description"
                  />
                </div>
              </div>
            ) : issue && (isEditing ? (
              <div className="edit-issue-form">
                <div className="form-group mb-3">
                  <label className="form-label">Summary</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={formData.summary}
                    onChange={(e) => handleFormChange('summary', e.target.value)}
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-control"
                    rows={5}
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="issue-details">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Status:</strong> 
                    <span className={`badge ms-2 ${issue.status === 'Done' ? 'bg-success' : issue.status === 'In Progress' ? 'bg-primary' : 'bg-secondary'}`}>
                      {issue.status}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <strong>Priority:</strong> 
                    <span className={`ms-2 ${issue.priority === 'High' ? 'text-danger' : issue.priority === 'Medium' ? 'text-warning' : 'text-success'}`}>
                      {issue.priority}
                    </span>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Assignee:</strong> {issue.assignee || 'Unassigned'}
                  </div>
                  <div className="col-md-6">
                    <strong>Type:</strong> {issue.issue_type}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Created:</strong> {new Date(issue.created).toLocaleDateString()}
                  </div>
                  <div className="col-md-6">
                    <strong>Updated:</strong> {new Date(issue.updated).toLocaleDateString()}
                  </div>
                </div>
                <div className="mb-3">
                  <strong>Summary:</strong>
                  <p className="mt-1">{issue.summary}</p>
                </div>
                {issue.description && (
                  <div className="mb-3">
                    <strong>Description:</strong>
                    <p className="mt-1">{issue.description}</p>
                  </div>
                )}
                <div className="mb-3">
                  <a 
                    href={issue.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary"
                  >
                    View in Jira
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="modal-footer">
            {!isCreating && issue && !isEditing && (
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleEdit}
              >
                Edit
              </button>
            )}
            {(isEditing || isCreating) && (
              <>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={loading || (isCreating && (!formData.projectKey || !formData.summary))}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            )}
            {!isEditing && !isCreating && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JiraIssueModal; 