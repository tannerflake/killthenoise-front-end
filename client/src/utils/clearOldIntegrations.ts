// Utility to clear old Jira integration data
export const clearOldJiraIntegrations = () => {
  // Clear old API token integration data
  localStorage.removeItem('jira_integration_id_old');
  
  // Clear any old form data
  localStorage.removeItem('jira_base_url');
  localStorage.removeItem('jira_access_token');
  
  console.log('Cleared old Jira integration data');
};

// Check if we have a valid OAuth integration
export const hasValidOAuthIntegration = () => {
  const integrationId = localStorage.getItem('jira_integration_id');
  return integrationId && integrationId.length > 0;
};

// Get the current OAuth integration ID
export const getCurrentOAuthIntegrationId = () => {
  return localStorage.getItem('jira_integration_id');
}; 