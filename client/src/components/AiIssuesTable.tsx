import React, { useEffect, useCallback, useState } from 'react';
import { apiClient, AiIssueGroup, AiIssueReportItem } from '../lib/api';
import { Badge, Button, Card, CardContent } from './ui';
import { useTenant } from '../context/TenantContext';
import JiraTicketCreationModal from './JiraTicketCreationModal';
import TypeBadge from './TypeBadge';
import TypeFilter from './TypeFilter';

interface AiIssuesTableProps {
  limit?: number;
}

function sourceIcon(source: string): string {
  switch (source?.toLowerCase()) {
    case 'hubspot':
      return '📊';
    case 'jira':
      return '🎫';
    case 'slack':
      return '💬';
    default:
      return '📁';
  }
}

function severityBadge(severity?: number | null) {
  if (severity == null) return <Badge variant="secondary">N/A</Badge>;
  if (severity >= 4) return <Badge variant="destructive">Critical</Badge>;
  if (severity >= 3) return <Badge className="bg-yellow-500 hover:bg-yellow-600">High</Badge>;
  if (severity >= 2) return <Badge className="bg-blue-500 hover:bg-blue-600">Medium</Badge>;
  return <Badge className="bg-green-500 hover:bg-green-600">Low</Badge>;
}

function statusBadge(status?: string | null) {
  if (!status) return <Badge variant="secondary">Unknown</Badge>;
  const s = status.toLowerCase();
  if (s === 'open' || s === 'todo' || s === 'to do') return <Badge className="bg-yellow-500 hover:bg-yellow-600">Open</Badge>;
  if (s === 'in_progress' || s === 'in progress') return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>;
  if (s === 'closed' || s === 'done') return <Badge className="bg-green-500 hover:bg-green-600">Closed</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

function getJiraKeysFromReports(reports: AiIssueReportItem[]): { key: string; url?: string }[] {
  const jiraReports = reports.filter(report => report.source === 'jira' && report.external_id);
  return jiraReports.map(report => ({
    key: report.external_id!,
    url: report.url || undefined
  }));
}

function renderStatusColumn(group: AiIssueGroup, groupReports?: AiIssueReportItem[], onCreateTicket?: (group: AiIssueGroup) => void) {
  // If we have reports loaded for this group, check for Jira keys
  if (groupReports && groupReports.length > 0) {
    const jiraTickets = getJiraKeysFromReports(groupReports);
    if (jiraTickets.length > 0) {
      return (
        <div className="d-flex flex-wrap gap-1">
          {jiraTickets.map((ticket, index) => (
            ticket.url ? (
              <a 
                key={`${ticket.key}-${index}`}
                href={ticket.url} 
                target="_blank" 
                rel="noreferrer" 
                className="badge text-white text-decoration-none rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1"
                style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  backgroundColor: '#6c7b8a'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                🎫 {ticket.key}
              </a>
            ) : (
              <span 
                key={`${ticket.key}-${index}`}
                className="badge text-white rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1"
                style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  backgroundColor: '#6c7b8a'
                }}
              >
                🎫 {ticket.key}
              </span>
            )
          ))}
        </div>
      );
    }
  }
  
  // If no Jira ticket found, show clickable "No Ticket 🎟️"
  return (
    <button
      onClick={() => onCreateTicket?.(group)}
      className="badge text-white rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1"
      style={{ 
        fontSize: '0.75rem', 
        fontWeight: '500',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        backgroundColor: '#8b0000',
        cursor: 'pointer'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        e.currentTarget.style.backgroundColor = '#660000';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        e.currentTarget.style.backgroundColor = '#8b0000';
      }}
      title="Click to create Jira ticket"
    >
      🎟️ No Ticket
    </button>
  );
}

const AiIssuesTable: React.FC<AiIssuesTableProps> = ({ limit = 20 }) => {
  const { tenantId } = useTenant();
  const [groups, setGroups] = useState<AiIssueGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [reports, setReports] = useState<Record<string, { loading: boolean; error: string | null; items: AiIssueReportItem[] }>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroupForTicket, setSelectedGroupForTicket] = useState<AiIssueGroup | null>(null);
  const [selectedType, setSelectedType] = useState('all');

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch AI issues first
      try {
        const res = await apiClient.listAiIssues(tenantId, limit);
        if (res.success && res.data && res.data.length > 0) {
          setGroups(res.data || []);
          return;
        }
      } catch (aiErr: any) {
        console.log('AI issues not available, falling back to regular issues');
      }
      
      // Fallback to regular issues if AI issues fail or are empty
      const regularIssuesRes = await apiClient.listIssues(undefined, limit);
      if (regularIssuesRes.success && regularIssuesRes.data) {
        // Transform regular issues to match AI issue group format
        const transformedGroups = regularIssuesRes.data.map((issue, index) => ({
          id: `regular-${issue.id}`,
          tenant_id: tenantId,
          title: issue.title,
          summary: issue.description || issue.title,
          severity: issue.severity,
          status: issue.status,
          type: issue.type,
          ai_type_confidence: issue.ai_type_confidence,
          ai_type_reasoning: issue.ai_type_reasoning,
          tags: issue.tags,
          frequency: 1,
          sources: [{ source: issue.source, count: 1 }],
          updated_at: issue.updated_at || issue.created_at
        }));
        setGroups(transformedGroups);
      } else {
        setError('Failed to load issues');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [tenantId, limit]);

  const fetchReports = async (groupId: string) => {
    setReports(prev => ({ ...prev, [groupId]: { loading: true, error: null, items: prev[groupId]?.items || [] } }));
    try {
      const res = await apiClient.getAiIssueReports(groupId);
      setReports(prev => ({ ...prev, [groupId]: { loading: false, error: null, items: res.data || [] } }));
    } catch (err: any) {
      setReports(prev => ({ ...prev, [groupId]: { loading: false, error: err?.message || 'Failed to load reports', items: [] } }));
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Auto-fetch reports for groups with Jira sources to get Jira keys
  useEffect(() => {
    groups.forEach(group => {
      const hasJiraSource = group.sources?.some(source => source.source === 'jira');
      if (hasJiraSource && !reports[group.id]) {
        fetchReports(group.id);
      }
    });
  }, [groups]);

  const handleToggleReports = (groupId: string) => {
    const nextId = expandedGroupId === groupId ? null : groupId;
    setExpandedGroupId(nextId);
    if (nextId && !reports[nextId]) {
      fetchReports(nextId);
    }
  };

  const handleCreateTicket = (group: AiIssueGroup) => {
    setSelectedGroupForTicket(group);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedGroupForTicket(null);
  };

  const handleTicketCreated = () => {
    // Refresh the groups to show the new ticket
    fetchGroups();
    // Also refresh reports for the specific group if they're loaded
    if (selectedGroupForTicket && reports[selectedGroupForTicket.id]) {
      fetchReports(selectedGroupForTicket.id);
    }
  };

  // Filter groups by type
  const filteredGroups = selectedType === 'all' 
    ? groups 
    : groups.filter(group => {
        if (selectedType === 'feature_request') {
          return group.type === 'feature_request' || group.type === 'feature';
        }
        return group.type === selectedType;
      });

  // Calculate type statistics
  const typeStats = {
    feature_request: groups.filter(g => g.type === 'feature_request' || g.type === 'feature').length,
    bug: groups.filter(g => g.type === 'bug').length,
    total: groups.length
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-secondary">Loading AI issues…</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="alert alert-danger mb-3">{error}</div>
          <Button onClick={fetchGroups}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="mb-2">No AI issues yet. Try syncing your integrations.</div>
            <Button onClick={fetchGroups}>Refresh</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const truncate = (text: string, max = 140) => {
    if (!text) return '';
    return text.length > max ? `${text.substring(0, max)}…` : text;
  };

  return (
    <div>
      {/* Type Filter and Statistics */}
      <div className="mb-4">
        <TypeFilter 
          selectedType={selectedType} 
          onTypeChange={setSelectedType} 
        />
        {typeStats.total > 0 && (
          <div className="flex gap-4 text-sm text-gray-600 mb-3">
            <span>✨ {typeStats.feature_request} Feature Requests</span>
            <span>🐛 {typeStats.bug} Bugs</span>
            <span>📊 {typeStats.total} Total Issues</span>
            {groups.length > 0 && groups[0].id.startsWith('regular-') && (
              <span className="text-blue-600">📋 Showing Regular Issues (AI clustering not available)</span>
            )}
          </div>
        )}
      </div>
      
      <div className="table-responsive">
        <table className="table" style={{ width: '100%' }}>
        <colgroup>
          <col style={{ width: '18%' }} />
          <col style={{ width: '45%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '5%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Issue</th>
            <th>Summary</th>
            <th>Type</th>
            <th>Severity</th>
            <th>Jira Ticket</th>
            <th>Reports</th>
          </tr>
        </thead>
        <tbody>
          {filteredGroups.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-500">
                <p>No issues found{selectedType !== 'all' ? ` for ${selectedType === 'feature_request' ? 'feature requests' : 'bugs'}` : ''}.</p>
              </td>
            </tr>
          ) : (
            filteredGroups.map(group => (
              <React.Fragment key={group.id}>
                <tr>
                  <td><strong>{group.title}</strong></td>
                  <td className="text-secondary text-sm">{truncate(group.summary, 160)}</td>
                  <td>
                    {group.type ? (
                      <TypeBadge 
                        type={group.type}
                        confidence={group.ai_type_confidence}
                        reasoning={group.ai_type_reasoning}
                        showConfidence={false}
                      />
                    ) : (
                      <Badge variant="secondary">Unknown</Badge>
                    )}
                  </td>
                  <td>{severityBadge(group.severity)}</td>
                  <td>{renderStatusColumn(group, reports[group.id]?.items, handleCreateTicket)}</td>
                  <td>
                    <Button className="btn btn-sm" onClick={() => handleToggleReports(group.id)}>
                      {group.frequency}
                    </Button>
                  </td>
                </tr>
                {expandedGroupId === group.id && (
                  <tr>
                    <td colSpan={6}>
                      <div className="p-3 bg-light rounded">
                        {(reports[group.id]?.loading) && <div className="text-secondary">Loading reports…</div>}
                        {(reports[group.id]?.error) && <div className="alert alert-danger">{reports[group.id]?.error}</div>}
                        {!reports[group.id]?.loading && !reports[group.id]?.error && (
                          <ul className="list-unstyled mb-0">
                            {(reports[group.id]?.items || []).map(item => (
                              <li key={item.id} className="mb-2 d-flex gap-2 align-start">
                                <span>{sourceIcon(item.source)}</span>
                                <div>
                                  {item.url ? (
                                    <a href={item.url} target="_blank" rel="noreferrer" className="fw-semibold">
                                      {item.title}
                                    </a>
                                  ) : (
                                    <span className="fw-semibold">{item.title}</span>
                                  )}
                                  <div className="text-xs text-secondary">
                                    <span className="mr-2 text-capitalize">{item.source}</span>
                                    {item.external_id && <span className="mr-2">#{item.external_id}</span>}
                                    <span>{new Date(item.created_at).toLocaleString()}</span>
                                  </div>
                                </div>
                              </li>
                            ))}
                            {(!reports[group.id] || reports[group.id]?.items?.length === 0) && (
                              <li className="text-secondary">No contributing reports found.</li>
                            )}
                          </ul>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
      </div>
      
      {/* Jira Ticket Creation Modal */}
      <JiraTicketCreationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        aiIssueGroup={selectedGroupForTicket}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  );
};

export default AiIssuesTable;