import type { AxiosInstance } from 'axios';
import type { CalendarEventDTO } from '@app-types/calendar';

export interface ICalendarApi {
  getEvents(month: Date): Promise<CalendarEventDTO[]>;
}

// Backend payload (CalendarEventSchema).
interface CalendarEventPayload {
  id: string;
  title: string;
  datetime: string;
}

// Local date as YYYY-MM-DD - toISOString() would shift it to UTC.
const toDateParam = (date: Date): string =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

const fromPayload = (data: CalendarEventPayload): CalendarEventDTO => ({
  id: data.id,
  title: data.title,
  datetime: new Date(data.datetime),
});

export const createCalendarApi = (http: AxiosInstance): ICalendarApi => ({
  getEvents: async (month) => {
    const { data } = await http.get<CalendarEventPayload[]>(
      '/calendar/events',
      { params: { month: toDateParam(month) } },
    );
    return data.map(fromPayload);
  },
});
