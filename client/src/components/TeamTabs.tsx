import React, { useState, useEffect } from 'react';
import { Team } from '../lib/api';
import { apiClient } from '../lib/api';
import { useTenant } from '../context/TenantContext';

interface TeamTabsProps {
  selectedTeam: string | null;
  onTeamChange: (teamId: string | null) => void;
}

const TeamTabs: React.FC<TeamTabsProps> = ({ selectedTeam, onTeamChange }) => {
  const { tenantId } = useTenant();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, [tenantId]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await apiClient.listTeams(tenantId);
      if (response.success) {
        setTeams(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <div className="py-4 px-3 text-gray-500">Loading teams...</div>
          </nav>
        </div>
      </div>
    );
  }

  // Don't show team tabs if no teams are configured
  if (teams.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors ${
              selectedTeam === null
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => onTeamChange(null)}
          >
            All Teams
          </button>
          
          {teams.map((team) => (
            <button
              key={team.id}
              className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors ${
                selectedTeam === team.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => onTeamChange(team.id)}
            >
              {team.name}

            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TeamTabs;
