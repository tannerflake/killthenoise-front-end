import React, { useEffect, useMemo, useState } from 'react';
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

const AiIssuesTable: React.FC<AiIssuesTableProps> = ({ limit = 20 }) => {
  const { tenantId } = useTenant();
  const [groups, setGroups] = useState<AiIssueGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [reports, setReports] = useState<Record<string, { loading: boolean; error: string | null; items: AiIssueReportItem[] }>>({});

  const fetchGroups = async () => {
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
  };

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
  }, [tenantId, limit]);

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
            <th>Status</th>
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
                <td>{statusBadge(group.status)}</td>
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