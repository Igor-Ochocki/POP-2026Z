import { httpClient } from '@api/httpClient';
import { createHealthApi } from '@api/modules/healthApi';
import { createGamesApi } from '@api/modules/gamesApi';
import { createCalendarApi } from '@api/modules/calendarApi';
import { createActionsApi } from '@api/modules/actionsApi';
import { createScenariosApi } from '@api/modules/scenariosApi';

// Unified API client used by presenter hooks: apiClient.<module>.<method>()
// Register every new API module here.
export const apiClient = {
  health: createHealthApi(httpClient),
  games: createGamesApi(httpClient),
  calendar: createCalendarApi(httpClient),
  actions: createActionsApi(httpClient),
  scenarios: createScenariosApi(httpClient),
};

export type ApiClient = typeof apiClient;
