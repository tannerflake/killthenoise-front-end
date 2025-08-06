// Debug utility for Jira integration issues
export const debugJiraIntegration = () => {
  console.log('=== JIRA INTEGRATION DEBUG ===');
  
  // Check localStorage
  const integrationId = localStorage.getItem('jira_integration_id');
  console.log('Integration ID in localStorage:', integrationId);
  
  // Check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  console.log('URL parameters:', {
    success: urlParams.get('success'),
    integration_id: urlParams.get('integration_id'),
    provider: urlParams.get('provider'),
    error: urlParams.get('error')
  });
  
  // Check environment
  console.log('Environment:', {
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
    currentUrl: window.location.href
  });
  
  return {
    integrationId,
    urlParams: {
      success: urlParams.get('success'),
      integration_id: urlParams.get('integration_id'),
      provider: urlParams.get('provider'),
      error: urlParams.get('error')
    }
  };
};

// Test API endpoints
export const testJiraAPI = async (tenantId: string, integrationId: string) => {
  console.log('=== TESTING JIRA API ===');
  
  try {
    // Test status endpoint
    const statusUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/jira/status/${tenantId}/${integrationId}`;
    console.log('Testing status endpoint:', statusUrl);
    
    const statusResponse = await fetch(statusUrl);
    const statusData = await statusResponse.json();
    console.log('Status response:', statusData);
    
    // Test issues endpoint
    const issuesUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/jira/issues/${tenantId}/${integrationId}`;
    console.log('Testing issues endpoint:', issuesUrl);
    
    const issuesResponse = await fetch(issuesUrl);
    const issuesData = await issuesResponse.json();
    console.log('Issues response:', issuesData);
    
    return {
      status: { ok: statusResponse.ok, data: statusData },
      issues: { ok: issuesResponse.ok, data: issuesData }
    };
  } catch (error) {
    console.error('API test failed:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}; 