import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { apiClient, AiIssueGroup } from '../lib/api';
import { Button, Card, CardHeader, CardTitle, CardContent, Alert, AlertDescription } from './ui';

// Simple toast hook
const useToast = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  return { showToast, toast };
};

interface JiraTicketCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiIssueGroup: AiIssueGroup | null;
  onTicketCreated?: () => void;
}

const JiraTicketCreationModal: React.FC<JiraTicketCreationModalProps> = ({
  isOpen,
  onClose,
  aiIssueGroup,
  onTicketCreated
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast, toast } = useToast();

  // Initialize form data when modal opens
  React.useEffect(() => {
    if (isOpen && aiIssueGroup) {
      setTitle(aiIssueGroup.title || '');
      setDescription(aiIssueGroup.summary || '');
      setError(null);
    }
  }, [isOpen, aiIssueGroup]);

  const generateAIDescription = async () => {
    if (!aiIssueGroup) return;
    
    try {
      setGeneratingDescription(true);
      setError(null);
      
      // Try to use the AI service first
      try {
        const result = await apiClient.generateJiraDescription({
          title: aiIssueGroup.title,
          summary: aiIssueGroup.summary
        });
        
        setDescription(result.data.description);
        return;
      } catch (aiError) {
        console.warn('AI service not available, using template fallback:', aiError);
      }
      
      // Fallback to template-based generation
      const generatedDescription = `👤 User Story:
• As a **user** I want **${aiIssueGroup.title.toLowerCase()}** in order to **resolve the reported issues and improve user experience**.

✅ Acceptance Criteria:
• Investigate and identify the root cause of the reported issue
• Implement a solution that addresses the core problem
• Test the fix to ensure it resolves the issue without introducing new problems
• Deploy the solution to production environment
• Verify that the issue is resolved and document the changes

💡 Additional Info:
• Original issue summary: ${aiIssueGroup.summary}
• This ticket was auto-generated from AI-detected issue group
• Priority should be based on severity and impact assessment`;

      setDescription(generatedDescription);
    } catch (err: any) {
      setError('Failed to generate AI description. Please write the description manually.');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aiIssueGroup) return;
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await apiClient.createJiraTicketFromAiIssue(aiIssueGroup.id, {
        title: title.trim(),
        description: description.trim()
      });

      // Show success toast with hyperlinked ticket
      const toastMessage = (
        <div>
          <div className="font-semibold">✅ Jira ticket created successfully!</div>
          <div className="mt-1">
            Ticket: <a 
              href={result.data.ticket_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-mono"
            >
              {result.data.ticket_key}
            </a>
          </div>
        </div>
      );
      
      showToast(toastMessage as any, 'success');

      // Call the callback to refresh the table
      if (onTicketCreated) {
        onTicketCreated();
      }

      // Close the modal after a short delay
      setTimeout(() => {
        handleClose();
      }, 1000);

    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create Jira ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto z-10">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Create Jira Ticket</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                ✕
              </Button>
            </div>
            {aiIssueGroup && (
              <p className="text-sm text-muted-foreground">
                Creating ticket for: <strong>{aiIssueGroup.title}</strong>
              </p>
            )}
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Ticket Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter ticket title"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="description" className="block text-sm font-medium">
                      Ticket Description *
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateAIDescription}
                      disabled={generatingDescription}
                      className="text-xs"
                    >
                      {generatingDescription ? '🤖 Generating...' : '🤖 Enhance with AI'}
                    </Button>
                  </div>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                    placeholder="Enter ticket description or click 'Generate with AI' to auto-generate"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    AI will generate a structured description with User Story, Acceptance Criteria, and Additional Info sections.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Ticket'}
                  </Button>
                </div>
              </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return createPortal(
    <>
      {modalContent}
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[60]">
          <div className={`rounded-lg border p-4 shadow-lg max-w-sm ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start">
              <div className="flex-1">
                {typeof toast.message === 'string' ? (
                  <div className="text-sm font-medium">{toast.message}</div>
                ) : (
                  toast.message
                )}
              </div>
              <button
                onClick={() => showToast('', 'success')}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default JiraTicketCreationModal;
