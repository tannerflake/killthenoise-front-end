import React, { useState } from 'react';
import { Button } from './ui';
import { apiClient } from '../lib/api';
import { useTenant } from '../context/TenantContext';

interface AiClusteringControlsProps {
  onRefresh?: () => void;
}

const AiClusteringControls: React.FC<AiClusteringControlsProps> = ({ onRefresh }) => {
  const { tenantId } = useTenant();
  const [reclustering, setReclustering] = useState(false);
  const [cleanup, setCleanup] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRecluster = async () => {
    try {
      setReclustering(true);
      setMessage(null);
      
      const response = await apiClient.reclusterAiIssues(tenantId);
      if (response.success) {
        setMessage({ type: 'success', text: 'AI clustering refreshed successfully!' });
        onRefresh?.();
      } else {
        setMessage({ type: 'error', text: 'Failed to refresh clustering' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error refreshing clustering' });
    } finally {
      setReclustering(false);
    }
  };

  const handleCleanup = async () => {
    try {
      setCleanup(true);
      setMessage(null);
      
      const response = await apiClient.cleanupDuplicateIssues(tenantId);
      if (response.success) {
        setMessage({ type: 'success', text: 'Duplicate cleanup completed!' });
        onRefresh?.();
      } else {
        setMessage({ type: 'error', text: 'Failed to cleanup duplicates' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error cleaning up duplicates' });
    } finally {
      setCleanup(false);
    }
  };

  return (
    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">AI Clustering Controls</h4>
          <p className="text-xs text-gray-600">
            Force re-clustering or cleanup duplicate issues
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleRecluster}
            disabled={reclustering}
            className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {reclustering ? 'Reclustering...' : '🔄 Recluster'}
          </Button>
          
          <Button
            onClick={handleCleanup}
            disabled={cleanup}
            className="text-xs px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white"
          >
            {cleanup ? 'Cleaning...' : '🧹 Cleanup'}
          </Button>
        </div>
      </div>
      
      {message && (
        <div className={`mt-2 p-2 rounded text-xs ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default AiClusteringControls;
