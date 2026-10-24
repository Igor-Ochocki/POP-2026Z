import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import type { CalendarViewModel, ICalendarActions } from '@app-types/calendar';
import { mockEvents } from '@views/CalendarView/mocks';

export function useCalendar(): {
  state: CalendarViewModel;
  actions: ICalendarActions;
} {
  const navigate = useNavigate();

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
    state: { events: mockEvents },
    actions: { onBack, onEventDetails, onDateClick, onAddEvent },
  };
}
