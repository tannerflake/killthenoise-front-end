import React, { useEffect, useCallback, useState } from 'react';
import { apiClient, AiIssueGroup, AiIssueReportItem } from '../lib/api';
import { Badge, Button, Card, CardContent } from './ui';
import { useTenant } from '../context/TenantContext';

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

function renderStatusColumn(group: AiIssueGroup, groupReports?: AiIssueReportItem[]) {
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
  
  // If no Jira ticket found, show "No Ticket 🎟️"
  return (
    <span 
      className="badge bg-light text-muted border rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1"
      style={{ 
        fontSize: '0.75rem', 
        fontWeight: '500',
        backgroundColor: '#f8f9fa !important',
        borderColor: '#dee2e6 !important'
      }}
    >
      🎟️ No Ticket
    </span>
  );
}

const AiIssuesTable: React.FC<AiIssuesTableProps> = ({ limit = 20 }) => {
  const { tenantId } = useTenant();
  const [groups, setGroups] = useState<AiIssueGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [reports, setReports] = useState<Record<string, { loading: boolean; error: string | null; items: AiIssueReportItem[] }>>({});

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.listAiIssues(tenantId, limit);
      setGroups(res.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load AI issues');
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
    <div className="table-responsive">
      <table className="table" style={{ width: '100%' }}>
        <colgroup>
          <col style={{ width: '22%' }} />
          <col style={{ width: '56%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '8%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Issue</th>
            <th>Summary</th>
            <th>Severity</th>
            <th>Jira Ticket</th>
            <th>Reports</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(group => (
            <React.Fragment key={group.id}>
              <tr>
                <td><strong>{group.title}</strong></td>
                <td className="text-secondary text-sm">{truncate(group.summary, 160)}</td>
                <td>{severityBadge(group.severity)}</td>
                <td>{renderStatusColumn(group, reports[group.id]?.items)}</td>
                <td>
                  <Button className="btn btn-sm" onClick={() => handleToggleReports(group.id)}>
                    {group.frequency}
                  </Button>
                </td>
              </tr>
              {expandedGroupId === group.id && (
                <tr>
                  <td colSpan={5}>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AiIssuesTable;