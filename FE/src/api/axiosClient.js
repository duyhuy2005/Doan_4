import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request Interceptor: Tự động đính kèm Token xác thực Bearer
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('autorental_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Trích xuất data chuẩn từ response envelope
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Lỗi kết nối máy chủ';
    console.warn('[AXIOS CLIENT WARNING]:', message);
    return Promise.reject(error);
  }
);

export default axiosClient;
