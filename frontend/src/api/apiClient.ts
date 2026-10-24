import { httpClient } from '@api/httpClient';
import { createHealthApi } from '@api/modules/healthApi';

// Unified API client used by presenter hooks: apiClient.<module>.<method>()
// Register every new API module here.
export const apiClient = {
  health: createHealthApi(httpClient),
};

export type ApiClient = typeof apiClient;
