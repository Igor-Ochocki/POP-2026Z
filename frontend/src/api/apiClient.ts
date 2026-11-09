import { httpClient } from '@api/httpClient';
import { createHealthApi } from '@api/modules/healthApi';
import { createGamesApi } from '@api/modules/gamesApi';
import { createCalendarApi } from '@api/modules/calendarApi';

// Unified API client used by presenter hooks: apiClient.<module>.<method>()
// Register every new API module here.
export const apiClient = {
  health: createHealthApi(httpClient),
  games: createGamesApi(httpClient),
  calendar: createCalendarApi(httpClient),
};

export type ApiClient = typeof apiClient;
