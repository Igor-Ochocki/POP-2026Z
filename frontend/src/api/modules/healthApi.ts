import type { AxiosInstance } from 'axios'
import type { HealthStatusDTO } from '@app-types/health'

// Example API module - copy this file when adding a new backend resource.
export const createHealthApi = (http: AxiosInstance) => ({
  getStatus: async (): Promise<HealthStatusDTO> => {
    const { data } = await http.get<HealthStatusDTO>('/health')
    return data
  },
})

export type HealthApi = ReturnType<typeof createHealthApi>
