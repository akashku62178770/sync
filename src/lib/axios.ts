import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useStore } from '@/store/useStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1::8000/api';

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // No refresh token, logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        useStore.getState().clearTokens(); // Ensure store state is cleared
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access, refresh } = response.data;

        localStorage.setItem('access_token', access);
        if (refresh) {
          localStorage.setItem('refresh_token', refresh);
        }
        useStore.getState().setTokens(access, refresh || refreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        processQueue(null, access);
        isRefreshing = false;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;

        // Refresh failed, logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        useStore.getState().clearTokens();
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    // Global Error Notification
    // We don't notify for 401s (handled above) or 404s (often handled by UI) unless critical?
    // Let's notify for 500s and explicit bad requests that aren't validation errors handled by forms.
    const status = error.response?.status;
    const message = (error.response?.data as any)?.error?.message || error.message || 'An unexpected error occurred';

    if (status && status >= 500) {
      useStore.getState().addNotification('error', `Server Error: ${message}`);
    } else if (status === 403) {
      useStore.getState().addNotification('error', `Permission Denied: ${message}`);
    } else if (status === 429) {
      useStore.getState().addNotification('warning', 'Too many requests. Please try again later.');
    } else if (!status) {
      // Network error
      useStore.getState().addNotification('error', 'Network Error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    message: string;
    detail?: unknown;
  };
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    detail?: unknown;
  };
}

// Helper to extract data from API response
export const extractData = <T>(response: { data: ApiResponse<T> }): T => {
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Request failed');
  }
  return response.data.data as T;
};