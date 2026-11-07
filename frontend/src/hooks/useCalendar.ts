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

  const onEventDetails = useCallback((eventId: string) => {
    console.log('Szczegóły wydarzenia', eventId);
  }, []);

  const onDateClick = useCallback((dateStr: string) => {
    console.log('Kliknięto dzień', dateStr);
  }, []);

  const onAddEvent = useCallback(() => {
    console.log('Dodaj wydarzenie');
  }, []);

  return {
    state,
    actions: {
      onShowCalendar,
      onBack,
      onEventDetails,
      onDateClick,
      onAddEvent,
    },
  };
}
