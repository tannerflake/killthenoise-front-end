# HubSpot OAuth Setup Guide

## 🚨 Current Issue: Redirect URL Mismatch

You're getting this error because the redirect URL in your HubSpot app settings doesn't match what your application is using.

**Current redirect URL in your app:** `http://localhost:8000/api/hubspot/oauth/callback`

## 🔧 How to Fix This

### Option 1: Update HubSpot App Settings (Recommended)

1. **Go to HubSpot Developer Portal:**
   - Visit: https://developers.hubspot.com/
   - Sign in to your developer account

2. **Find Your App:**
   - Navigate to your app in the developer portal
   - Go to the "Auth" or "OAuth" settings

3. **Update Redirect URL:**
   - Add or update the redirect URL to: `http://localhost:8000/api/hubspot/oauth/callback`
   - Save the changes

4. **Test the Connection:**
   - Try connecting again from your application

### Option 2: Update Your Application's Redirect URL

If your HubSpot app is configured with a different redirect URL, update your application:

1. **Create Environment File:**
   ```bash
   # In the client directory
   cp .env.sample .env
   ```

2. **Set the Correct Redirect URL:**
   ```env
   REACT_APP_HUBSPOT_REDIRECT_URI=YOUR_HUBSPOT_APP_REDIRECT_URL
   ```

3. **Restart Your Application:**
   ```bash
   npm start
   ```

## 📋 Environment Variables

Create a `.env` file in the `client` directory with these variables:

```env
# API Configuration
REACT_APP_API_BASE=http://localhost:8000

# HubSpot Configuration
REACT_APP_HUBSPOT_CLIENT_ID=c4f6d977-f797-4c43-9e9d-9bc867ea01ac
REACT_APP_HUBSPOT_REDIRECT_URI=http://localhost:8000/api/hubspot/oauth/callback

# Frontend Configuration
REACT_APP_FRONTEND_URL=http://localhost:3000
```

## 🔍 Troubleshooting

### Common Issues:

1. **Redirect URL Format:**
   - Must be exactly the same in both places
   - Include the full URL with protocol (http://)
   - No trailing slashes unless configured

2. **Port Configuration:**
   - Ensure your backend is running on port 8000
   - The callback endpoint must be available at `/api/hubspot/oauth/callback`

3. **HubSpot App Settings:**
   - Verify the client ID matches
   - Check that the app is in the correct environment (development/production)
   - Ensure the app has the required scopes (`tickets` and `oauth`)

### Debug Steps:

1. **Check Current Configuration:**
   ```javascript
   // In browser console
   console.log(process.env.REACT_APP_HUBSPOT_REDIRECT_URI);
   ```

2. **Verify Backend Endpoint:**
   ```bash
   curl http://localhost:8000/api/hubspot/oauth/callback
   ```

3. **Test OAuth URL:**
   - Open the generated OAuth URL in browser
   - Check if it redirects properly

## 🚀 Next Steps

After fixing the redirect URL:

1. **Test the OAuth Flow:**
   - Click "Connect to HubSpot" in your app
   - Complete the authorization
   - Verify the callback works

2. **Handle the Callback:**
   - Your backend should handle the OAuth callback
   - Store the access token securely
   - Test API calls to HubSpot

3. **Monitor Integration:**
   - Check the integration status
   - Verify data is being synced

## 📞 Need Help?

If you're still having issues:

1. **Check HubSpot Developer Documentation:** https://developers.hubspot.com/docs/api/oauth-quickstart-guide
2. **Verify your app settings** in the HubSpot developer portal
3. **Test with a simple redirect URL** first (e.g., `http://localhost:3000/callback`)

## 🔐 Security Notes

- Never commit your `.env` file to version control
- Use environment variables for all sensitive configuration
- Consider using HTTPS in production
- Implement proper token storage and refresh mechanisms 