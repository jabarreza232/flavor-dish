import axios from 'axios';
import { JWTMiddleware } from '../auth/jwtMiddleware';

const API_BASE_URL = 'https://api.flavordash.local/v1'; // Ganti dengan API real

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    const headers = await JWTMiddleware.addAuthHeader(config.headers);
    return { ...config, headers };
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const verification = await JWTMiddleware.verifyToken();
        if (verification.valid) {
          return api(originalRequest);
        } else {
          // Redirect to login
          throw new Error('Authentication failed');
        }
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);