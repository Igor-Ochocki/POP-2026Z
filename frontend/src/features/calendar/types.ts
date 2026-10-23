export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // 'YYYY-MM-DD'
  end?: string;
}
