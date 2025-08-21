import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AiIssuesTable from '../components/AiIssuesTable';
import { testBackendConnection } from '../utils/testBackendConnection';

const Dashboard: React.FC = () => {
  const [debugResult, setDebugResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    const result = await testBackendConnection();
    setDebugResult(result);
    setTesting(false);
  };

  return (
    <div className="dashboard">
      {/* Header (constrained) */}
      <div className="container">
        <div className="dashboard-header mb-4">
          <div>
            <h1 className="dashboard-main-title">Product Issue Dashboard</h1>
          </div>
          <div className="mt-3">
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={handleTestConnection}
              disabled={testing}
            >
              {testing ? 'Testing...' : 'Debug Backend Connection'}
            </button>
            {debugResult && (
              <div className="mt-2 p-3 bg-light rounded">
                <h6>Debug Result:</h6>
                <pre className="small">{JSON.stringify(debugResult, null, 2)}</pre>
              </div>
            )}
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

      {/* Removed inline HubSpot form link; now in header */}
    </div>
  );
};

export default Dashboard; 