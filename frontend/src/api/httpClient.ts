import axios from 'axios';
import { ApiError } from '@api/apiError';
import { env } from '@config/env';

// The ONLY axios instance in the app. Do not call axios directly anywhere else -
// add an API module in ./modules and register it in ./apiClient.ts instead.
export const httpClient = axios.create({
  baseURL: `${env.apiUrl}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Common place for global error handling (auth, logging, toasts...).
    if (axios.isAxiosError(error)) {
      // Backend errors carry a readable message in { detail } (AppError).
      const detail: unknown = error.response?.data?.detail;
      return Promise.reject(
        new ApiError(
          error.response?.status ?? null,
          typeof detail === 'string' ? detail : error.message,
        ),
      );
    }
    return Promise.reject(error);
  },
);
