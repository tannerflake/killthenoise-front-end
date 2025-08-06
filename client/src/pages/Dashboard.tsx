import React, { useState, useEffect } from 'react';
import { useTopIssues } from '../hooks/useIssues';
import IssueTable from '../components/IssueTable';
import StatsCards from '../components/StatsCards';
import { Button, Card, CardHeader, CardTitle, CardContent, Alert, AlertDescription } from '../components/ui';

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



interface ApiResponse {
  success: boolean;
  data: Issue[];
  count: number;
}

const Dashboard: React.FC = () => {
  const { issues, loading, error } = useTopIssues(10);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    totalIssues: 0,
    criticalIssues: 0,
    openIssues: 0,
    avgSeverity: 0
  });

  useEffect(() => {
    if (typeFilter === 'all') {
      setFilteredIssues(issues);
    } else {
      setFilteredIssues(issues.filter(issue => issue.type === typeFilter));
    }
  }, [issues, typeFilter]);

  // Calculate stats from issues
  useEffect(() => {
    if (issues.length > 0) {
      const totalIssues = issues.length;
      const criticalIssues = issues.filter(issue => issue.severity >= 4).length;
      const openIssues = issues.filter(issue => issue.status === 'open').length;
      const avgSeverity = totalIssues > 0 
        ? issues.reduce((sum, issue) => sum + issue.severity, 0) / totalIssues 
        : 0;

      setStats({
        totalIssues,
        criticalIssues,
        openIssues,
        avgSeverity: Math.round(avgSeverity * 10) / 10
      });
    }
  }, [issues]);


  if (error) {
    return (
      <div className="container">
        <Card>
          <CardContent className="text-center p-6">
            <h3>Error</h3>
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button className="mt-4" onClick={() => {}}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header mb-4">
          <div>
            <h1>Product Issue Dashboard</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          {/* Issues Table - Full Width */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Top Product Issues</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="typeFilter" className="text-sm font-medium">Type:</label>
                  <select 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md text-sm bg-background"
                  >
                    <option value="all">All Types</option>
                    <option value="bug">Bugs</option>
                    <option value="feature">FR</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center p-4">
                  <p>Loading issues...</p>
                </div>
              ) : (
                <IssueTable issues={filteredIssues} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 