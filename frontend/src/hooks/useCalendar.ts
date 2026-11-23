import { useState } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router';
import { apiClient } from '@api/apiClient';
import type {
  CalendarMode,
  CalendarViewModel,
  ICalendarActions,
  ICalendarWindows,
} from '@app-types/calendar';

const CALENDAR_PATH = '/calendar';
const HOME_PATH = '/';
const LOAD_ERROR = 'Nie udało się wczytać wydarzeń. Spróbuj ponownie.';

const initialState: CalendarViewModel = {
  events: [],
  month: null,
  mode: 'slots',
  errorMessage: null,
};

function createCalendarWindows(navigate: NavigateFunction): ICalendarWindows {
  return {
    showCalendarView: () => void navigate(CALENDAR_PATH),
  };
}

export function useCalendar(): {
  state: CalendarViewModel;
  actions: ICalendarActions;
} {
  const navigate = useNavigate();
  const [state, setState] = useState<CalendarViewModel>(initialState);
  const windows = createCalendarWindows(navigate);

  const loadEvents = async (month: Date, mode: CalendarMode) => {
    setState((prev) => ({ ...prev, month, mode, errorMessage: null }));
    try {
      const events =
        mode === 'events'
          ? await apiClient.events.getEvents(month)
          : await apiClient.calendar.getEvents(month);
      // Ignore responses for a month or mode the user has already left.
      setState((prev) =>
        prev.month === month && prev.mode === mode ? { ...prev, events } : prev,
      );
    } catch {
      setState((prev) =>
        prev.month === month && prev.mode === mode
          ? { ...prev, events: [], errorMessage: LOAD_ERROR }
          : prev,
      );
    }
  };

  // Called by the calendar whenever it shows a month (also on first render),
  // so only CalendarView triggers the API - other views just open it.
  const onChangeMonth = (month: Date) => loadEvents(month, state.mode);

  const onChangeMode = (mode: CalendarMode) => {
    if (!state.month) return;
    setState((prev) => ({ ...prev, events: [] }));
    void loadEvents(state.month, mode);
  };

  return {
    state,
    actions: {
      onShowCalendar: windows.showCalendarView,
      onChangeMonth: (month) => void onChangeMonth(month),
      onChangeMode,
      onBack: () => void navigate(HOME_PATH),
    },
  };
}
