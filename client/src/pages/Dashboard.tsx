import React, { useState, useEffect } from 'react';
// import { useTopIssues } from '../hooks/useIssues';
// import IssueTable from '../components/IssueTable';
import StatsCards from '../components/StatsCards';
import { Button, Card, CardHeader, CardTitle, CardContent, Alert, AlertDescription } from '../components/ui';
import AiIssuesTable from '../components/AiIssuesTable';
import { useTenant } from '../context/TenantContext';

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

const Dashboard: React.FC = () => {
  const { tenantId } = useTenant();
  const [error, setError] = useState<string | null>(null);

  // In the AI issues implementation, stats can be calculated later from groups if needed
  const [stats, setStats] = useState({
    totalIssues: 0,
    criticalIssues: 0,
    openIssues: 0,
    avgSeverity: 0
  });

  return (
    <div className="dashboard">
      {/* Header (constrained) */}
      <div className="container">
        <div className="dashboard-header mb-4">
          <div>
            <h1 className="dashboard-main-title">Product Issue Dashboard</h1>
          </div>
        </div>
      </div>

      {/* AI Issues List (full-bleed with 50px margins) */}
      <div className="ai-issues-bleed">
        <div className="card mt-4">
          <div className="card-header">
            <h3 className="mb-0">AI Issues</h3>
          </div>
          <div className="card-body">
            <AiIssuesTable limit={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 