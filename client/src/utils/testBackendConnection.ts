// Utility to test backend connection and debug network errors
export const testBackendConnection = async () => {
  const baseURL = process.env.REACT_APP_API_BASE || 'https://killthenoise-back-end-production.up.railway.app';
  
  console.log('Testing backend connection...');
  console.log('Base URL:', baseURL);
  console.log('Current domain:', window.location.origin);
  
  try {
    // Test 1: Simple GET request
    console.log('Test 1: Testing simple GET request...');
    const response1 = await fetch(`${baseURL}/api/issues/top?limit=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': 'demo-tenant'
      }
    });
    
    console.log('Response 1 status:', response1.status);
    console.log('Response 1 headers:', Object.fromEntries(response1.headers.entries()));
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('Response 1 data:', data1);
    } else {
      console.log('Response 1 error:', await response1.text());
    }
    
    // Test 2: OPTIONS request to check CORS
    console.log('Test 2: Testing CORS with OPTIONS request...');
    const response2 = await fetch(`${baseURL}/api/issues/top`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,X-Tenant-ID'
      }
    });
    
    console.log('Response 2 status:', response2.status);
    console.log('Response 2 headers:', Object.fromEntries(response2.headers.entries()));
    
    return {
      success: response1.ok,
      corsSupported: response2.status === 200,
      details: {
        baseURL,
        frontendOrigin: window.location.origin,
        response1Status: response1.status,
        response2Status: response2.status
      }
    };
    
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return {
      success: false,
      corsSupported: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        baseURL,
        frontendOrigin: window.location.origin
      }
    };
  }
};
