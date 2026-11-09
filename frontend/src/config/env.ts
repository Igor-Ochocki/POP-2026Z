// Single place for reading Vite environment variables (see .env.example).
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  // Temporary user identity until login exists - sent as user_id to the backend.
  devUserId: import.meta.env.VITE_DEV_USER_ID ?? 'dev-user',
} as const;
