import axios from 'axios';
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
    return Promise.reject(error);
  },
);
