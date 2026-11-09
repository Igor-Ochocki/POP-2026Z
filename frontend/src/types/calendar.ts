export interface CalendarEventDTO {
  id: string;
  title: string;
  datetime: Date;
}

export interface CalendarViewModel {
  events: CalendarEventDTO[];
  month: Date | null;
  errorMessage: string | null;
}

export interface ICalendarActions {
  onShowCalendar(): void;
  onChangeMonth(month: Date): void;
  onBack(): void;
}

export interface ICalendarWindows {
  showCalendarView(): void;
}
