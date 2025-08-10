import React from 'react';
import AiIssuesTable from '../components/AiIssuesTable';

const Dashboard: React.FC = () => {

  return (
    <div className="dashboard">
      {/* Header (constrained) */}
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-main-title">Product Issue Dashboard</h1>
          </div>
        </div>
      </div>

      {/* AI Issues List (full-bleed with 50px margins) */}
      <div className="ai-issues-bleed">
        <div className="card">
          <div className="card-header">
            <h3 className="mb-0">AI-Generated Issue List</h3>
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