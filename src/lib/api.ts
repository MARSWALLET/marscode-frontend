import axios from 'axios';

// Create an Axios instance configured to point to the FastAPI backend
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    // In a real browser environment, check localStorage for the token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('marscoder_access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if Unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('marscoder_access_token');
        localStorage.removeItem('marscoder_user');
        // Prevent redirect loop if already on auth pages
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
            window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
