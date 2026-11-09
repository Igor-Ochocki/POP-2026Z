import { useState } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router';
import { apiClient } from '@api/apiClient';
import type {
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

  // Called by the calendar whenever it shows a month (also on first render),
  // so only CalendarView triggers the API - other views just open it.
  const onChangeMonth = async (month: Date) => {
    setState((prev) => ({ ...prev, month, errorMessage: null }));
    try {
      const events = await apiClient.calendar.getEvents(month);
      // Ignore responses for a month the user has already left.
      setState((prev) => (prev.month === month ? { ...prev, events } : prev));
    } catch {
      setState((prev) =>
        prev.month === month
          ? { ...prev, events: [], errorMessage: LOAD_ERROR }
          : prev,
      );
    }
  };

  return {
    state,
    actions: {
      onShowCalendar: windows.showCalendarView,
      onChangeMonth: (month) => void onChangeMonth(month),
      onBack: () => void navigate(HOME_PATH),
    },
  };
}
