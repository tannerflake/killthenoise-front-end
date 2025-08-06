// Test script to verify Jira API token works directly
const testJiraToken = async () => {
  const baseUrl = 'https://killthenoise.atlassian.net';
  
  // Test 1: Check if Jira instance is accessible
  console.log('Test 1: Checking if Jira instance is accessible...');
  try {
    const serverInfoResponse = await fetch(`${baseUrl}/rest/api/3/serverInfo`);
    console.log('Server info response status:', serverInfoResponse.status);
    
    if (serverInfoResponse.ok) {
      const serverInfo = await serverInfoResponse.json();
      console.log('✅ Jira instance is accessible:', serverInfo.baseUrl);
    } else {
      console.log('❌ Jira instance not accessible:', serverInfoResponse.status);
    }
  } catch (error) {
    console.log('❌ Error accessing Jira instance:', error.message);
  }

  // Test 2: Test with a sample token (you'll need to replace this)
  console.log('\nTest 2: Testing API token (replace with your actual token)...');
  console.log('To test your token, replace the token in this script and run:');
  console.log('node test-jira-token.js');
  
  // Uncomment and replace with your actual token to test:
  /*
  const testToken = 'YOUR_ACTUAL_TOKEN_HERE';
  try {
    const userResponse = await fetch(`${baseUrl}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('User info response status:', userResponse.status);
    
    if (userResponse.ok) {
      const userInfo = await userResponse.json();
      console.log('✅ Token is valid:', userInfo.displayName);
    } else {
      const errorData = await userResponse.text();
      console.log('❌ Token is invalid:', errorData);
    }
  } catch (error) {
    console.log('❌ Error testing token:', error.message);
  }
  */
};

testJiraToken(); 