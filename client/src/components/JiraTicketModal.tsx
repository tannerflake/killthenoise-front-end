import React, { useState, useEffect } from 'react';
import { AiIssueGroup, apiClient } from '../lib/api';
import { Button } from './ui';

interface JiraTicketModalProps {
  show: boolean;
  onHide: () => void;
  aiIssue: AiIssueGroup | null;
  onTicketCreated: (ticketKey: string, ticketUrl: string) => void;
}

const JiraTicketModal: React.FC<JiraTicketModalProps> = ({
  show,
  onHide,
  aiIssue,
  onTicketCreated
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate structured description from AI issue
  const generateJiraDescription = (aiIssue: AiIssueGroup): string => {
    const title = aiIssue.title || '';
    const summary = aiIssue.summary || '';
    
    // Extract key details for user story generation
    const isFeature = title.toLowerCase().includes('implement') || title.toLowerCase().includes('add') || title.toLowerCase().includes('create');
    const isBug = title.toLowerCase().includes('error') || title.toLowerCase().includes('bug') || title.toLowerCase().includes('issue') || title.toLowerCase().includes('problem');
    
    let userStory = '';
    let acceptanceCriteria = '';
    let additionalInfo = '';
    
    if (isFeature) {
      // Generate user story for features
      const feature = title.replace(/implement|add|create/gi, '').trim();
      userStory = `As a user, I want ${feature.toLowerCase()} so that I can have an improved experience with the platform.`;
      acceptanceCriteria = `The ${feature.toLowerCase()} should be fully functional and accessible to users`;
      additionalInfo = summary;
    } else if (isBug) {
      // Generate user story for bugs
      userStory = `As a user, I want the ${title.toLowerCase()} to be resolved so that I can use the platform without interruption.`;
      acceptanceCriteria = `The issue should be completely resolved and tested to prevent recurrence`;
      additionalInfo = summary;
    } else {
      // Generic user story
      userStory = `As a user, I want ${title.toLowerCase()} to be addressed so that the platform works as expected.`;
      acceptanceCriteria = `The requirement should be implemented according to specifications`;
      additionalInfo = summary;
    }
    
    return `👤 *User Story:*
• ${userStory}

✅ *Acceptance Criteria:*
• ${acceptanceCriteria}

💡 *Additional Info:*
• ${additionalInfo}`;
  };

  // Auto-fill form when aiIssue changes
  useEffect(() => {
    if (aiIssue) {
      setTitle(aiIssue.title || '');
      setDescription(generateJiraDescription(aiIssue));
    }
    setError(null);
  }, [aiIssue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aiIssue) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.createJiraTicketFromAiIssue(aiIssue.id, {
        title: title.trim(),
        description: description.trim()
      });
      
      if (response.success && response.data) {
        onTicketCreated(response.data.ticket_key, response.data.ticket_url);
      } else {
        throw new Error(response.message || 'Failed to create Jira ticket');
      }
      onHide();
      
    } catch (err: any) {
      setError(err?.message || 'Failed to create Jira ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onHide();
  };

  if (!show) return null;

  return (
    <div 
      className="modal-backdrop" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={handleClose}
    >
      <div 
        className="modal-dialog" 
        style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          width: '90%', 
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Create Jira Ticket</h3>
            <button 
              onClick={handleClose}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '24px', 
                cursor: 'pointer', 
                padding: '0',
                color: '#6c757d'
              }}
              disabled={loading}
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div 
                style={{ 
                  backgroundColor: '#f8d7da', 
                  color: '#721c24', 
                  padding: '12px', 
                  borderRadius: '4px', 
                  marginBottom: '16px',
                  border: '1px solid #f5c6cb'
                }}
              >
                {error}
              </div>
            )}
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Title <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="Enter ticket title"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Description <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <textarea
                rows={6}
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder="Enter ticket description"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  minHeight: '120px'
                }}
              />
            </div>
            
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '24px' }}>
              <strong>Note:</strong> This will create a new ticket in your Jira project and automatically 
              associate it with this AI issue group.
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button 
                onClick={handleClose}
                disabled={loading}
                style={{ 
                  backgroundColor: '#6c757d', 
                  borderColor: '#6c757d',
                  padding: '10px 20px'
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={loading || !title.trim() || !description.trim()}
                style={{ 
                  backgroundColor: '#6c7b8a', 
                  borderColor: '#6c7b8a',
                  padding: '10px 20px'
                }}
              >
                {loading ? (
                  <>
                    <span style={{ marginRight: '8px' }}>⏳</span>
                    Creating Ticket...
                  </>
                ) : (
                  '🎫 Create Jira Ticket'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JiraTicketModal;