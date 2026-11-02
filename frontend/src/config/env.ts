// Single place for reading Vite environment variables (see .env.example).
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
} as const;
