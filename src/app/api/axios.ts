import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5163/api', // Default API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors globally (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid/expired token silently.
      // ProtectedRoute handles redirecting to /login for protected pages.
      // Public pages (Home, Courses) must NOT be force-redirected.
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
