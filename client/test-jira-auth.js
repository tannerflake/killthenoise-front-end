// Test Jira API token with Basic Authentication
const testJiraBasicAuth = async () => {
  const baseUrl = 'https://killthenoise.atlassian.net';
  
  console.log('Testing Jira API token with Basic Authentication...');
  console.log('');
  console.log('To test your token:');
  console.log('1. Replace YOUR_EMAIL with your Atlassian account email');
  console.log('2. Replace YOUR_TOKEN with your actual API token');
  console.log('3. Run: node test-jira-auth.js');
  console.log('');
  
  // Replace these with your actual values
  const email = 'YOUR_EMAIL@example.com';  // Your Atlassian account email
  const token = 'YOUR_TOKEN';              // Your API token
  
  if (email === 'YOUR_EMAIL@example.com' || token === 'YOUR_TOKEN') {
    console.log('❌ Please update the email and token in this script first');
    return;
  }
  
  try {
    // Create Basic Auth header
    const authString = `${email}:${token}`;
    const authBytes = Buffer.from(authString, 'ascii');
    const authB64 = authBytes.toString('base64');
    
    console.log('Testing with Basic Authentication...');
    
    const response = await fetch(`${baseUrl}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Basic ${authB64}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const userInfo = await response.json();
      console.log('✅ Token works! User info:', {
        displayName: userInfo.displayName,
        emailAddress: userInfo.emailAddress,
        accountId: userInfo.accountId
      });
    } else {
      const errorText = await response.text();
      console.log('❌ Token failed:', errorText);
      console.log('');
      console.log('Possible issues:');
      console.log('1. Wrong email address');
      console.log('2. Wrong API token');
      console.log('3. Token doesn\'t have right permissions');
      console.log('4. Need to use Bearer auth instead');
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
};

testJiraBasicAuth(); 