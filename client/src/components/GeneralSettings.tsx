import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button } from './ui';
import { apiClient } from '../lib/api';
import { useTenant } from '../context/TenantContext';

interface GeneralSettingsData {
  grouping_instructions?: string;
  type_classification_instructions?: string;
  severity_calculation_instructions?: string;
}

const GeneralSettings: React.FC = () => {
  const { tenantId } = useTenant();
  const [settings, setSettings] = useState<GeneralSettingsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, [tenantId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getGeneralSettings(tenantId);
      if (response.success) {
        setSettings(response.data || {});
      } else {
        setError('Failed to load settings');
      }
    } catch (err: any) {
      console.error('Failed to fetch settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await apiClient.updateGeneralSettings(tenantId, settings);
      if (response.success) {
        setSuccess('Settings updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to update settings');
      }
    } catch (err: any) {
      console.error('Failed to update settings:', err);
      setError('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof GeneralSettingsData, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-2 text-gray-600">Loading settings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-3">AI Behavior Instructions</h3>
          <p className="text-gray-600 mb-6">
            Customize how our AI agent works for your organization. 
            These instructions will apply to all new issues going forward.
          </p>

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

          <div className="space-y-6">
            {/* Grouping Instructions */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="grouping" className="block text-sm font-medium text-gray-700">
                  How should the AI group similar items?
                </label>
                <div className="group relative">
                  <svg
                    className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 w-80 pointer-events-none">
                    Provide specific criteria for how the AI should identify and group related issues together. For example, group by functionality, user impact, or technical area.
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <textarea
                id="grouping"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
                placeholder="e.g., Group issues by similar functionality or user impact. Consider grouping payment-related issues together, and authentication issues separately."
                value={settings.grouping_instructions || ''}
                onChange={(e) => handleInputChange('grouping_instructions', e.target.value)}
              />
            </div>

            {/* Type Classification Instructions */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="classification" className="block text-sm font-medium text-gray-700">
                  How should the AI distinguish between bugs and feature requests?
                </label>
                <div className="group relative">
                  <svg
                    className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 w-80 pointer-events-none">
                    Define keywords, phrases, or patterns that indicate whether an issue is a bug (something broken) or a feature request (new functionality).
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <textarea
                id="classification"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
                placeholder="e.g., Consider anything that mentions 'broken', 'not working', 'error', or 'failed' as a bug. Feature requests typically mention 'add', 'implement', 'new feature', or 'enhancement'."
                value={settings.type_classification_instructions || ''}
                onChange={(e) => handleInputChange('type_classification_instructions', e.target.value)}
              />
            </div>

            {/* Severity Calculation Instructions */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                  How should the AI calculate severity?
                </label>
                <div className="group relative">
                  <svg
                    className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 w-80 pointer-events-none">
                    Specify rules for assigning severity scores (0-100). Consider factors like user impact, business criticality, security implications, and technical complexity.
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <textarea
                id="severity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
                placeholder="e.g., Anything that touches an enterprise client should automatically be ranked very high (90-100). Security issues should be 95+. Payment issues should be 80+. UI improvements should be 20-40."
                value={settings.severity_calculation_instructions || ''}
                onChange={(e) => handleInputChange('severity_calculation_instructions', e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6">
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings;
