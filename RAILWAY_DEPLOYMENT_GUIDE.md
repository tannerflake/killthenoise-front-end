# Railway Deployment Guide

## Fixing Network Error with Backend

### 1. Set Environment Variables in Railway

In your Railway dashboard for the **frontend** project:

1. Go to your frontend project in Railway
2. Click on "Variables" tab
3. Add the following environment variable:

```
REACT_APP_API_BASE=https://killthenoise-back-end-production.up.railway.app
```

### 2. Backend CORS Configuration

Your backend needs to allow requests from your frontend domain. In your backend code, ensure CORS is configured to allow your frontend domain.

**Example CORS configuration for FastAPI:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.up.railway.app",  # Your frontend URL
        "http://localhost:3000",  # For local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Debug Steps

1. **Deploy the updated frontend** with the debug button
2. **Click "Debug Backend Connection"** on the Dashboard
3. **Check the console logs** for detailed error information
4. **Review the debug result** to see what's failing

### 4. Common Issues

- **CORS Error**: Backend not allowing frontend domain
- **Wrong Backend URL**: Verify the backend URL is correct
- **Environment Variable Not Set**: Ensure `REACT_APP_API_BASE` is set in Railway
- **Backend Not Running**: Check if backend is deployed and running

### 5. Testing

After setting environment variables and CORS:

1. Redeploy your frontend
2. Test the connection using the debug button
3. Check browser console for detailed error messages
4. Verify backend is responding to direct requests

### 6. Railway Environment Variables

Make sure to set these in your Railway frontend project:
- `REACT_APP_API_BASE`: Your backend URL
- Any other environment variables your app needs
