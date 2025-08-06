// HubSpot OAuth Configuration
export const hubspotConfig = {
  clientId: process.env.REACT_APP_HUBSPOT_CLIENT_ID || 'c4f6d977-f797-4c43-9e9d-9bc867ea01ac',
  redirectUri: process.env.REACT_APP_HUBSPOT_REDIRECT_URI || 'http://localhost:8000/api/hubspot/oauth/callback',
  scope: 'tickets oauth',
  authUrl: 'https://app-na2.hubspot.com/oauth/authorize'
};

export const getHubSpotAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: hubspotConfig.clientId,
    redirect_uri: hubspotConfig.redirectUri,
    scope: hubspotConfig.scope
  });
  
  return `${hubspotConfig.authUrl}?${params.toString()}`;
}; 