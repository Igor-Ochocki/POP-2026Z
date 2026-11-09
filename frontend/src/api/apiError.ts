// Error thrown by every apiClient call - hooks check `status` instead of depending on axios.
export class ApiError extends Error {
  // HTTP status of the response, or null when there was no response (network error, timeout).
  readonly status: number | null;

  constructor(status: number | null, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
