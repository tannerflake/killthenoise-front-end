// Test script to debug backend Jira validation
const testBackendJiraValidation = async () => {
  const tenantId = '550e8400-e29b-41d4-a716-446655440000';
  
  // Test with the exact same data that the frontend is sending
  const testData = {
    access_token: 'ATATT3xFfGF0...', // Replace with your actual token
    base_url: 'https://killthenoise.atlassian.net'
  };

  console.log('Testing backend Jira validation...');
  console.log('Request data:', {
    ...testData,
    access_token: testData.access_token.substring(0, 10) + '...'
  });

  try {
    const response = await fetch(`http://localhost:8000/api/jira/integrations/${tenantId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ Backend validation failed');
      if (data.detail && data.detail.suggestions) {
        console.log('Suggestions:');
        data.detail.suggestions.forEach((suggestion, index) => {
          console.log(`${index + 1}. ${suggestion}`);
        });
      }
    } else {
      console.log('✅ Backend validation succeeded');
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
};

console.log('To test with your actual token:');
console.log('1. Replace the access_token in this script with your real token');
console.log('2. Run: node test-backend-jira.js');
console.log('');
console.log('This will show exactly what error the backend is getting from Jira.');

testBackendJiraValidation(); 