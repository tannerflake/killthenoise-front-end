# Jira Integration Setup Guide

This guide will help you set up a real Jira integration that connects to your actual Jira instance.

## Prerequisites

### 1. Jira Instance
You need access to a Jira instance (either Jira Cloud or Jira Server/Data Center):
- **Jira Cloud**: `https://your-domain.atlassian.net`
- **Jira Server**: `https://your-jira-server.com`

### 2. Backend API
Make sure your backend API is running on `http://localhost:8000` and has the Jira integration endpoints implemented.

## Step 1: Create a Jira API Token

### For Jira Cloud:
1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a label (e.g., "KillTheNoise Integration")
4. Copy the generated token (you won't be able to see it again)

### For Jira Server:
1. Go to your Jira instance
2. Navigate to **User Settings** → **Personal Access Tokens**
3. Click "Create token"
4. Give it a name and copy the token

## Step 2: Get Your Jira Base URL

### For Jira Cloud:
- Your base URL is: `https://your-domain.atlassian.net`
- Replace `your-domain` with your actual Atlassian domain

### For Jira Server:
- Your base URL is: `https://your-jira-server.com`
- Use your actual Jira server URL

## Step 3: Connect the Integration

1. **Start your frontend application**:
   ```bash
   cd client
   npm start
   ```

2. **Navigate to the Integrations page**:
   - Go to `http://localhost:3000/integrations`
   - You'll see the "Jira Integration" card

3. **Click "Connect Jira"**:
   - Enter your Jira Base URL
   - Enter your API Access Token
   - Click "Connect"

4. **Verify the connection**:
   - You should see "Connected ✔" with your user information
   - If there's an error, check your credentials and try again

## Step 4: Test the Integration

1. **Navigate to Jira Issues**:
   - Go to `http://localhost:3000/jira`
   - Or click "Jira Issues" in the navigation

2. **Sync Issues**:
   - Click "Sync Issues" to fetch issues from your Jira instance
   - You should see your actual Jira issues listed

3. **Test Issue Management**:
   - Click on any issue to view details
   - Try creating a new issue
   - Test filtering and searching

## Troubleshooting

### Common Issues:

#### 1. "Invalid credentials" error
- **Solution**: Double-check your API token and base URL
- Make sure the token has the necessary permissions

#### 2. "Connection failed" error
- **Solution**: Verify your Jira instance is accessible
- Check if your Jira instance requires VPN or special access

#### 3. "No issues found" after connection
- **Solution**: 
  - Make sure you have issues in your Jira projects
  - Check if your API token has permission to read issues
  - Try syncing issues manually

#### 4. Backend API errors
- **Solution**: 
  - Ensure your backend is running on `http://localhost:8000`
  - Check backend logs for detailed error messages
  - Verify the Jira integration endpoints are implemented

### API Token Permissions

Your Jira API token needs these permissions:
- **Read issues**: To view and list issues
- **Create issues**: To create new issues
- **Edit issues**: To update existing issues
- **Read projects**: To list available projects
- **Read user information**: To verify connection

## Advanced Configuration

### Custom JQL Queries
You can modify the JQL query in the backend to filter issues:
- Default: `ORDER BY updated DESC`
- Custom: Add your own JQL filters

### Project Filtering
The integration will show issues from all projects you have access to. To limit to specific projects, modify the backend JQL query.

### Issue Types
Supported issue types:
- Task
- Bug
- Story
- Epic

## Security Considerations

### API Token Security
- **Never commit API tokens to version control**
- **Rotate tokens regularly**
- **Use minimal required permissions**
- **Store tokens securely in your backend**

### Network Security
- **Use HTTPS for all connections**
- **Verify SSL certificates**
- **Consider VPN for internal Jira instances**

## Backend Requirements

Your backend needs these endpoints implemented:

```bash
# Test these endpoints with curl or Postman:

# List integrations
GET http://localhost:8000/api/jira/integrations/{tenant_id}

# Create integration
POST http://localhost:8000/api/jira/integrations/{tenant_id}
{
  "access_token": "your-token",
  "base_url": "https://your-domain.atlassian.net"
}

# Test connection
GET http://localhost:8000/api/jira/status/{tenant_id}/{integration_id}

# List issues
GET http://localhost:8000/api/jira/issues/{tenant_id}/{integration_id}

# Get specific issue
GET http://localhost:8000/api/jira/issues/{tenant_id}/{integration_id}/{issue_key}

# Create issue
POST http://localhost:8000/api/jira/issues/{tenant_id}/{integration_id}
{
  "project_key": "PROJ",
  "summary": "New issue",
  "description": "Issue description",
  "issue_type": "Task"
}

# Update issue
PUT http://localhost:8000/api/jira/issues/{tenant_id}/{integration_id}/{issue_key}
{
  "summary": "Updated summary"
}

# List projects
GET http://localhost:8000/api/jira/projects/{tenant_id}/{integration_id}

# Sync issues
POST http://localhost:8000/api/jira/sync/{tenant_id}/{integration_id}?sync_type=full
```

## Testing Checklist

- [ ] Backend API is running on port 8000
- [ ] Jira instance is accessible
- [ ] API token has correct permissions
- [ ] Base URL is correct
- [ ] Frontend can connect to Jira
- [ ] Issues are syncing properly
- [ ] Can view issue details
- [ ] Can create new issues
- [ ] Can edit existing issues
- [ ] Filters and search work
- [ ] Error handling works properly

## Support

If you encounter issues:

1. **Check browser console** for frontend errors
2. **Check backend logs** for API errors
3. **Verify Jira credentials** and permissions
4. **Test API endpoints** directly with curl/Postman
5. **Check network connectivity** to your Jira instance

## Next Steps

Once the integration is working:

1. **Customize the UI** to match your needs
2. **Add more filtering options** (by project, assignee, etc.)
3. **Implement issue templates** for common issue types
4. **Add bulk operations** for multiple issues
5. **Set up automated syncing** on a schedule
6. **Add notifications** for new issues or updates 