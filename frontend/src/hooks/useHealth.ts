import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@api/apiClient';
import type { HealthViewModel, IHealthActions } from '@app-types/health';

const initialState: HealthViewModel = {
  health: null,
  isLoading: true,
  errorMessage: null,
};

async function loadHealth(): Promise<HealthViewModel> {
  try {
    const health = await apiClient.health.getStatus();
    return { health, isLoading: false, errorMessage: null };
  } catch {
    return {
      health: null,
      isLoading: false,
      errorMessage: 'Brak połączenia z backendem',
    };
  }
}

// Presenter: owns the view state and exposes actions. Views never call the API.
export function useHealth(): {
  state: HealthViewModel;
  actions: IHealthActions;
} {
  const [state, setState] = useState<HealthViewModel>(initialState);

  useEffect(() => {
    let cancelled = false;
    void loadHealth().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const onRefresh = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true, errorMessage: null }));
    void loadHealth().then(setState);
  }, []);

  return { state, actions: { onRefresh } };
}
