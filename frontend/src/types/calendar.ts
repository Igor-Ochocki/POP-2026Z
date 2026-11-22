export interface CalendarEventDTO {
  id: string;
  title: string;
  datetime: Date;
}

// slots - every time slot (PU1); events - paid reservations open for joining (PU46).
export type CalendarMode = 'slots' | 'events';

export interface CalendarViewModel {
  events: CalendarEventDTO[];
  month: Date | null;
  mode: CalendarMode;
  errorMessage: string | null;
}

export interface ICalendarActions {
  onShowCalendar(): void;
  onChangeMonth(month: Date): void;
  onChangeMode(mode: CalendarMode): void;
  onBack(): void;
}

export interface ICalendarWindows {
  showCalendarView(): void;
}
