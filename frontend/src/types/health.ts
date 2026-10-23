export interface HealthStatusDTO {
  status: string
  database: string
}

export interface HealthViewModel {
  health: HealthStatusDTO | null
  isLoading: boolean
  errorMessage: string | null
}

export interface IHealthActions {
  onRefresh(): void
}
