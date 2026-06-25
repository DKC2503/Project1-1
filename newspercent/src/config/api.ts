import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to attach JWT Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling and token expiry
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Session Expired or Unauthorized. Logging out...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/'; // Force redirect to login
        } else if (!error.response) {
            console.error('SERVER OFFLINE:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
