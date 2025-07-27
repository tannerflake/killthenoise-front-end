import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || 'http://localhost:8000',
  withCredentials: true,
});

// Optional: interceptors for global error handling could be added here. 