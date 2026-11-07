export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // 'YYYY-MM-DD'
  end?: string;
}

export interface CalendarViewModel {
  events: CalendarEvent[];
}

export interface ICalendarActions {
  onShowCalendar: () => void;
  onBack: () => void;
  onEventDetails: (eventId: string) => void;
  onDateClick: (dateStr: string) => void;
  onAddEvent: () => void;
}
