import React from 'react';

interface StatsCardsProps {
  stats: {
    totalIssues: number;
    criticalIssues: number;
    openIssues: number;
    avgSeverity: number;
  };
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="stats-grid mb-4">
      <div className="stats-card card">
        <div className="card-body text-center">
          <div className="stats-icon">📊</div>
          <h3 className="stats-number">{stats.totalIssues}</h3>
          <p className="stats-label">Total Issues</p>
        </div>
      </div>

      <div className="stats-card card">
        <div className="card-body text-center">
          <div className="stats-icon">🚨</div>
          <h3 className="stats-number">{stats.criticalIssues}</h3>
          <p className="stats-label">Critical Issues</p>
        </div>
      </div>

      <div className="stats-card card">
        <div className="card-body text-center">
          <div className="stats-icon">🔓</div>
          <h3 className="stats-number">{stats.openIssues}</h3>
          <p className="stats-label">Open Issues</p>
        </div>
      </div>

      <div className="stats-card card">
        <div className="card-body text-center">
          <div className="stats-icon">⚡</div>
          <h3 className="stats-number">{stats.avgSeverity}</h3>
          <p className="stats-label">Avg Severity</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards; 