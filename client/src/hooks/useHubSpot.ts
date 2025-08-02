import { useState } from 'react';
import { apiClient, HubSpotStatus, HubSpotTicket, TransformedHubSpotTicket } from '../lib/api';

export const useHubSpot = (tenantId: string, integrationId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatus = async (): Promise<HubSpotStatus> => {
    try {
      setLoading(true);
      setError(null);
      return await apiClient.getHubSpotStatus(tenantId, integrationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get HubSpot status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const syncTickets = async (syncType: 'full' | 'incremental' = 'full') => {
    try {
      setLoading(true);
      setError(null);
      return await apiClient.syncHubSpot(tenantId, integrationId, syncType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync HubSpot tickets');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const listTickets = async (limit?: number): Promise<TransformedHubSpotTicket[]> => {
    try {
      setLoading(true);
      setError(null);
      console.log('API call params:', { tenantId, integrationId, limit });
      const response = await apiClient.listHubSpotTickets(tenantId, integrationId, limit);
      console.log('Full API response:', response);
      console.log('Response tickets:', response.tickets);
      
      // Transform HubSpot ticket format to frontend format
      const transformedTickets = (response.tickets || []).map(ticket => ({
        id: ticket.id,
        title: ticket.properties?.subject || 'No Title',
        description: ticket.properties?.content || 'No Description',
        created_at: ticket.createdAt,
        severity: ticket.properties?.hs_ticket_priority === 'URGENT' ? 5 : 
                 ticket.properties?.hs_ticket_priority === 'HIGH' ? 4 :
                 ticket.properties?.hs_ticket_priority === 'MEDIUM' ? 3 :
                 ticket.properties?.hs_ticket_priority === 'LOW' ? 2 : 1,
        source: 'hubspot'
      }));
      
      console.log('Transformed tickets:', transformedTickets);
      return transformedTickets;
    } catch (err) {
      console.error('API error details:', err);
      setError(err instanceof Error ? err.message : 'Failed to list HubSpot tickets');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getStatus,
    syncTickets,
    listTickets,
    loading,
    error,
  };
}; 