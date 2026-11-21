import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiClient } from '@api/apiClient';
import type { EventListViewModel, IEventListActions } from '@app-types/event';

const EVENT_LIST_PATH = '/events';
const LOAD_ERROR = 'Nie udało się wczytać wydarzeń. Spróbuj ponownie.';

async function loadEvents(): Promise<EventListViewModel> {
  try {
    const events = await apiClient.events.getEvents(new Date());
    return { events, errorMessage: null };
  } catch {
    return { events: [], errorMessage: LOAD_ERROR };
  }
}

export function useEventList(): {
  state: EventListViewModel;
  actions: IEventListActions & { onLoadEvents(): void };
} {
  const navigate = useNavigate();
  const [state, setState] = useState<EventListViewModel>({
    events: [],
    errorMessage: null,
  });

  useEffect(() => {
    let cancelled = false;
    void loadEvents().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    state,
    actions: {
      onOpenEventList: () => void navigate(EVENT_LIST_PATH),
      onLoadEvents: () => void loadEvents().then(setState),
    },
  };
}
