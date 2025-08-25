import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { apiClient, AiIssueGroup, AiIssueReportItem } from '../lib/api';
import { Badge, Button, Card, CardContent } from './ui';
import { useTenant } from '../context/TenantContext';
import JiraTicketCreationModal from './JiraTicketCreationModal';
import TypeBadge from './TypeBadge';
import TypeFilter from './TypeFilter';

type SortField = 'severity' | 'frequency' | 'title' | 'updated_at';
type SortDirection = 'asc' | 'desc';

interface AiIssuesTableProps {
  limit?: number;
  selectedTeam?: string | null;
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

function formatSources(sources: Array<{source: string, count: number}>): string {
  if (!sources || sources.length === 0) return 'Unknown';
  return sources.map(s => `${s.source} (${s.count})`).join(', ');
}

function getSourceBreakdown(sources: Array<{source: string, count: number}>): JSX.Element {
  if (!sources || sources.length === 0) {
    return <span className="text-gray-500">No sources</span>;
  }
  
  return (
    <div className="flex flex-wrap gap-1">
      {sources.map((source, index) => (
        <span 
          key={index}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
          title={`${source.count} issue${source.count > 1 ? 's' : ''} from ${source.source}`}
        >
          {sourceIcon(source.source)} {source.count}
        </span>
      ))}
    </div>
  );
}

function severityBadge(severity?: number | null) {
  if (severity == null) return <Badge variant="secondary">N/A</Badge>;
  
  // Intuitive color scale: Green (low) → Yellow → Orange → Red (high)
  if (severity >= 80) return <Badge variant="destructive">{severity}/100</Badge>; // Red - Critical
  if (severity >= 60) return <Badge className="bg-orange-500 hover:bg-orange-600">{severity}/100</Badge>; // Orange - High
  if (severity >= 40) return <Badge className="bg-yellow-500 hover:bg-yellow-600">{severity}/100</Badge>; // Yellow - Medium
  if (severity >= 20) return <Badge className="bg-lime-500 hover:bg-lime-600">{severity}/100</Badge>; // Lime - Low
  return <Badge className="bg-green-500 hover:bg-green-600">{severity}/100</Badge>; // Green - Very Low
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
                className="badge text-white text-decoration-none rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1"
                style={{ 
                  fontSize: '0.7rem', 
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
                className="badge text-white rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1"
                style={{ 
                  fontSize: '0.7rem', 
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
      className="badge text-white rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1"
      style={{ 
        fontSize: '0.7rem', 
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

const AiIssuesTable: React.FC<AiIssuesTableProps> = ({ limit = 20, selectedTeam }) => {
  const { tenantId } = useTenant();
  const [groups, setGroups] = useState<AiIssueGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [reports, setReports] = useState<Record<string, { loading: boolean; error: string | null; items: AiIssueReportItem[] }>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroupForTicket, setSelectedGroupForTicket] = useState<AiIssueGroup | null>(null);
  const [selectedType, setSelectedType] = useState(() => {
    const saved = localStorage.getItem('killthenoise-ai-issues-filter-type');
    return saved || 'all';
  });
  const [selectedJiraStatus, setSelectedJiraStatus] = useState(() => {
    const saved = localStorage.getItem('killthenoise-ai-issues-filter-jira');
    return saved || 'all';
  });
  const [selectedSeverity, setSelectedSeverity] = useState(() => {
    const saved = localStorage.getItem('killthenoise-ai-issues-filter-severity');
    return saved || 'all';
  });
  const [sortField, setSortField] = useState<SortField>(() => {
    const saved = localStorage.getItem('killthenoise-ai-issues-sort-field') as SortField;
    return saved || 'severity';
  });
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    const saved = localStorage.getItem('killthenoise-ai-issues-sort-direction') as SortDirection;
    return saved || 'desc';
  });


  // Save filter and sort preferences to localStorage
  useEffect(() => {
    localStorage.setItem('killthenoise-ai-issues-filter-type', selectedType);
  }, [selectedType]);

  useEffect(() => {
    localStorage.setItem('killthenoise-ai-issues-filter-jira', selectedJiraStatus);
  }, [selectedJiraStatus]);

  useEffect(() => {
    localStorage.setItem('killthenoise-ai-issues-filter-severity', selectedSeverity);
  }, [selectedSeverity]);

  useEffect(() => {
    localStorage.setItem('killthenoise-ai-issues-sort-field', sortField);
  }, [sortField]);

  useEffect(() => {
    localStorage.setItem('killthenoise-ai-issues-sort-direction', sortDirection);
  }, [sortDirection]);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch AI-grouped issues from the main issues endpoint
      const res = await apiClient.listIssues(undefined, limit);
      if (res.success && res.data) {
        // Transform the new AI-grouped data structure to match our existing interface
        const transformedGroups = res.data.map((issue) => ({
          id: issue.id,
          tenant_id: tenantId,
          title: issue.title,
          summary: issue.description,
          severity: issue.severity,
          status: issue.status,
          type: issue.type,
          ai_type_confidence: issue.ai_type_confidence,
          ai_type_reasoning: issue.ai_type_reasoning,
          tags: issue.tags || [],
          frequency: issue.frequency,
          sources: issue.sources,
          team_id: issue.team_id,
          updated_at: issue.updated_at
        }));
        setGroups(transformedGroups);
      } else {
        setError('Failed to load AI-grouped issues');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load AI-grouped issues');
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

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default direction
      setSortField(field);
      setSortDirection('desc');
    }
  };



  // Sort function
  const sortGroups = (groups: AiIssueGroup[]) => {
    return [...groups].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'severity':
          aValue = a.severity ?? 0;
          bValue = b.severity ?? 0;
          break;
        case 'frequency':
          aValue = a.frequency;
          bValue = b.frequency;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Filter groups by type, Jira status, and severity
  const filteredGroups = groups.filter(group => {
    // Type filter
    if (selectedType !== 'all') {
      if (selectedType === 'feature_request') {
        if (group.type !== 'feature_request' && group.type !== 'feature') {
          return false;
        }
      } else if (group.type !== selectedType) {
        return false;
      }
    }

    // Jira status filter
    if (selectedJiraStatus !== 'all') {
      const groupReports = reports[group.id]?.items;
      const hasJiraTicket = groupReports ? getJiraKeysFromReports(groupReports).length > 0 : false;
      if (selectedJiraStatus === 'has_ticket' && !hasJiraTicket) {
        return false;
      }
      if (selectedJiraStatus === 'no_ticket' && hasJiraTicket) {
        return false;
      }
    }

    // Severity filter
    if (selectedSeverity !== 'all') {
      const severity = group.severity ?? 0;
      switch (selectedSeverity) {
        case '80+':
          if (severity < 80) return false;
          break;
        case '<80':
          if (severity >= 80) return false;
          break;
      }
    }

    // Team filter
    if (selectedTeam) {
      // Filter issues by team_id
      if (group.team_id !== selectedTeam) {
        return false;
      }
    }

    return true;
  });

  // Sort the filtered groups
  const sortedGroups = sortGroups(filteredGroups);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-secondary">Loading AI-grouped issues…</div>
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
            <div className="mb-2">No AI-grouped issues yet. The system will automatically group similar issues as they come in.</div>
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

  // Sortable header component
  const SortableHeader: React.FC<{
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }> = ({ field, children, className = '' }) => {
    const isActive = sortField === field;
    const isAsc = isActive && sortDirection === 'asc';
    const isDesc = isActive && sortDirection === 'desc';

    const getSortText = () => {
      if (!isActive) return 'Click to sort';
      return `Sorted ${sortDirection === 'asc' ? 'ascending' : 'descending'}. Click to reverse.`;
    };

    return (
      <th 
        className={`cursor-pointer select-none hover:bg-gray-50 transition-colors ${className} ${isActive ? 'bg-blue-50' : ''}`}
        onClick={() => handleSort(field)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSort(field);
          }
        }}
        tabIndex={0}
        role="button"
        title={getSortText()}
      >
        <div className="flex items-center gap-1">
          <span className={isActive ? 'font-semibold' : ''}>{children}</span>
          <div className="flex flex-col">
            {isAsc ? (
              <span className="text-blue-600 text-sm">▲</span>
            ) : isDesc ? (
              <span className="text-blue-600 text-sm">▼</span>
            ) : (
              <div className="flex flex-col text-gray-400">
                <span className="text-xs leading-none">▲</span>
                <span className="text-xs leading-none">▼</span>
              </div>
            )}
          </div>
        </div>
      </th>
    );
  };

  return (
    <div>


      {/* Filters */}
      <div className="mb-6">
        <TypeFilter 
          selectedType={selectedType} 
          onTypeChange={setSelectedType}
          selectedJiraStatus={selectedJiraStatus}
          onJiraStatusChange={setSelectedJiraStatus}
          selectedSeverity={selectedSeverity}
          onSeverityChange={setSelectedSeverity}
        />
        
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
            <SortableHeader field="title">Item</SortableHeader>
            <th>Summary</th>
            <th>Type</th>
            <SortableHeader field="severity">Severity</SortableHeader>
            <th>Jira Ticket</th>
            <SortableHeader field="frequency">Contributing Reports</SortableHeader>
          </tr>
        </thead>
        <tbody>
          {sortedGroups.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-500">
                <p>No issues found matching the selected filters.</p>
              </td>
            </tr>
          ) : (
            sortedGroups.map(group => (
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
                  <td className="text-center">{renderStatusColumn(group, reports[group.id]?.items, handleCreateTicket)}</td>
                  <td>
                    <Button 
                      className="btn btn-sm" 
                      onClick={() => handleToggleReports(group.id)}
                      title={`${group.frequency} contributing report${group.frequency > 1 ? 's' : ''} grouped together by AI. Click to view details.`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{group.frequency}</span>
                        {group.frequency > 1 && (
                          <span className="text-xs text-gray-500">📊</span>
                        )}
                      </div>
                    </Button>
                  </td>
                </tr>
                {expandedGroupId === group.id && (
                  <tr>
                    <td colSpan={6}>
                      <div className="p-3 bg-light rounded">
                        <div className="mb-3 text-sm text-gray-600">
                          <strong>Contributing reports grouped together by AI:</strong> These {group.frequency} reports were automatically identified as similar and grouped together.
                        </div>
                        {(reports[group.id]?.loading) && <div className="text-secondary">Loading contributing reports…</div>}
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
                              <li className="text-secondary">No contributing reports found for this group.</li>
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
      
      {/* Results count */}
      {sortedGroups.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {sortedGroups.length} of {groups.length} AI-grouped issues
        </div>
      )}
      
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