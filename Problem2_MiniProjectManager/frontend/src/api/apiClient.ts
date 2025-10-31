import axios from 'axios';

// Debug: Check if env var is loaded
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5226/api/v1';
console.log('🔧 API Client Base URL:', baseURL);

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Debug: Log every request
  console.log('📤 API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    fullURL: `${config.baseURL}${config.url}`,
    hasToken: !!token
  });
  
  return config;
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    // Log the full error for debugging
    console.error('❌ API Error:', {
      url: error.config?.url,
      fullURL: error.config?.baseURL + error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      responseData: error.response?.data
    });

    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;