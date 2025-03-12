import axios from 'axios';

// Create an axios instance with base URL and default headers
const API_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authorization header
api.interceptors.request.use(
  async (config) => {
    // Get auth token from sessionStorage or localStorage if available
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error statuses
    if (error.response) {
      const { status } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        console.error('Authentication error. Please log in again.');
        // Optionally redirect to login page
      }
      
      // Handle permission errors
      if (status === 403) {
        console.error('Permission denied. You do not have access to this resource.');
      }
      
      // Handle not found errors
      if (status === 404) {
        console.error('Resource not found.');
      }
      
      // Handle server errors
      if (status >= 500) {
        console.error('Server error. Please try again later.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. Please check your connection.');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API functions for questions
export const serverQuestions = {
  getAll: () => api.get('/questions'),
  getById: (id) => api.get(`/questions/${id}`),
  create: (questionData) => api.post('/questions', questionData),
  update: (id, questionData) => api.put(`/questions/${id}`, questionData),
  delete: (id) => api.delete(`/questions/${id}`),
};

// API functions for folders
export const serverFolders = {
  getAll: () => api.get('/folders'),
  getById: (id) => api.get(`/folders/${id}`),
  create: (folderData) => api.post('/folders', folderData),
  update: (id, folderData) => api.put(`/folders/${id}`, folderData),
  delete: (id) => api.delete(`/folders/${id}`),
};

// API functions for analytics
export const serverAnalytics = {
  getDashboard: () => api.get('/analytics'),
  getUserStats: (userId) => api.get(`/analytics/users/${userId}`),
};

// Health check function
export const checkServerHealth = () => api.get('/health');

export default api; 