import React, { useState } from 'react';
import AiIssuesTable from '../components/AiIssuesTable';
import TeamTabs from '../components/TeamTabs';

const Dashboard: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  return (
    <div className="dashboard">
      {/* AI Issues List (full-bleed with 50px margins) */}
      <div className="ai-issues-bleed">
        <div className="card mt-4">
          <div className="card-body">
            <TeamTabs 
              selectedTeam={selectedTeam}
              onTeamChange={setSelectedTeam}
            />
            <AiIssuesTable limit={20} selectedTeam={selectedTeam} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 