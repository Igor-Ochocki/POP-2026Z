import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import type { CalendarViewModel, ICalendarActions } from '@app-types/calendar';
import { calendarMockEvents } from '@api/mocks/calendarMocks';

export function useCalendar(): {
  state: CalendarViewModel;
  actions: ICalendarActions;
} {
  const navigate = useNavigate();
  const [state] = useState<CalendarViewModel>({
    events: calendarMockEvents,
  });

  const onShowCalendar = useCallback(() => {
    navigate('/calendar');
  }, [navigate]);

  const onBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return {
    state,
    actions: {
      onShowCalendar,
      onBack,
    },
  };
}
