import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button } from './ui';
import { apiClient, Team } from '../lib/api';
import { useTenant } from '../context/TenantContext';

interface TeamsSettingsProps {}

const TeamsSettings: React.FC<TeamsSettingsProps> = () => {
  const { tenantId } = useTenant();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assignment_criteria: '',
    is_default_team: false
  });

  useEffect(() => {
    fetchTeams();
  }, [tenantId]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.listTeams(tenantId);
      if (response.success) {
        setTeams(response.data || []);
      } else {
        setError('Failed to load teams');
      }
    } catch (err: any) {
      console.error('Failed to fetch teams:', err);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      assignment_criteria: '',
      is_default_team: false
    });
    setEditingTeam(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.assignment_criteria.trim()) {
      setError('Team name and assignment criteria are required');
      return;
    }

    if (teams.length >= 10 && !editingTeam) {
      setError('Maximum of 10 teams allowed');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (editingTeam) {
        // Update existing team
        const response = await apiClient.updateTeam(tenantId, editingTeam.id, {
          name: formData.name,
          description: formData.description,
          assignment_criteria: formData.assignment_criteria,
          is_default_team: formData.is_default_team
        });
        
        if (response.success) {
          setSuccess('Team updated successfully');
          resetForm();
          fetchTeams();
        } else {
          setError('Failed to update team');
        }
      } else {
        // Create new team
        const response = await apiClient.createTeam(tenantId, {
          name: formData.name,
          description: formData.description,
          assignment_criteria: formData.assignment_criteria,
          is_default_team: formData.is_default_team
        });
        
        if (response.success) {
          setSuccess('Team created successfully');
          resetForm();
          fetchTeams();
        } else {
          setError('Failed to create team');
        }
      }
    } catch (err: any) {
      console.error('Failed to save team:', err);
      setError('Failed to save team');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description,
      assignment_criteria: team.assignment_criteria,
      is_default_team: team.is_default_team
    });
    setShowAddForm(true);
  };

  const handleDelete = async (teamId: string) => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const response = await apiClient.deleteTeam(tenantId, teamId);
      if (response.success) {
        setSuccess('Team deleted successfully');
        fetchTeams();
      } else {
        setError('Failed to delete team');
      }
    } catch (err: any) {
      console.error('Failed to delete team:', err);
      setError('Failed to delete team');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (teamId: string) => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await apiClient.setDefaultTeam(tenantId, teamId);
      if (response.success) {
        setSuccess('Default team updated successfully');
        fetchTeams();
      } else {
        setError('Failed to update default team');
      }
    } catch (err: any) {
      console.error('Failed to set default team:', err);
      setError('Failed to update default team');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-2 text-gray-600">Loading teams...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Team Management</h3>
              <p className="text-gray-600">
                Create teams to automatically assign issues based on natural language criteria. 
                Up to 10 teams allowed.
              </p>
            </div>
            {!showAddForm && teams.length < 10 && (
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add New Team
              </Button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
              {success}
            </div>
          )}

          {/* Add/Edit Team Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-medium mb-4">
                {editingTeam ? 'Edit Team' : 'Add New Team'}
              </h4>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    id="teamName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Frontend Team, Backend Team, DevOps"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    id="teamDescription"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the team"
                  />
                </div>

                <div>
                  <label htmlFor="teamCriteria" className="block text-sm font-medium text-gray-700 mb-1">
                    Assignment Criteria *
                  </label>
                  <textarea
                    id="teamCriteria"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                    value={formData.assignment_criteria}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignment_criteria: e.target.value }))}
                    placeholder="Describe in natural language what types of issues should be assigned to this team. e.g., 'All frontend UI issues, React components, CSS styling problems'"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use natural language to describe what issues belong to this team
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.is_default_team}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_default_team: e.target.checked }))}
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                    Set as default team for unassigned issues
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {saving ? 'Saving...' : (editingTeam ? 'Update Team' : 'Create Team')}
                  </Button>
                  <Button 
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Teams List */}
          <div className="space-y-4">
            {teams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No teams created yet. Create your first team to get started.</p>
              </div>
            ) : (
              teams.map((team) => (
                <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                                             <div className="flex items-center gap-2 mb-2">
                         <h4 className="text-lg font-medium">{team.name}</h4>
                         {team.is_default_team && (
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                             Default
                           </span>
                         )}
                       </div>
                      
                      {team.description && (
                        <p className="text-gray-600 mb-2">{team.description}</p>
                      )}
                      
                                             <div>
                         <p className="text-sm font-medium text-gray-700 mb-1">Assignment Criteria:</p>
                         <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{team.assignment_criteria}</p>
                       </div>
                    </div>
                    
                                         <div className="flex gap-2 ml-4">
                       {!team.is_default_team && (
                         <Button
                           onClick={() => handleSetDefault(team.id)}
                           disabled={saving}
                           className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white"
                         >
                           Set Default
                         </Button>
                       )}
                      <Button
                        onClick={() => handleEdit(team)}
                        className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(team.id)}
                        disabled={saving}
                        className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamsSettings;
