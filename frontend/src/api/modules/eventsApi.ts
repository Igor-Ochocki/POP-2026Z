import type { AxiosInstance } from 'axios';
import type { CalendarEventDTO } from '@app-types/calendar';
import type { EventDTO } from '@app-types/event';

export interface IEventsApi {
  getEvents(month: Date): Promise<CalendarEventDTO[]>;
  getEvent(reservId: string): Promise<EventDTO>;
  joinEvent(reservId: string, userId: string): Promise<EventDTO>;
}

// Backend payloads (CalendarEventSchema, EventSchema).
interface CalendarEventPayload {
  id: string;
  title: string;
  datetime: string;
}

interface EventPayload {
  reserv_id: string;
  users_registered: number;
  participants: string[];
  slot_id: string;
  game_id: string;
  participant_count: number;
  event_status: EventDTO['eventStatus'];
}

// Local date as YYYY-MM-DD - toISOString() would shift it to UTC.
const toDateParam = (date: Date): string =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

const fromPayload = (data: EventPayload): EventDTO => ({
  reservId: data.reserv_id,
  usersRegistered: data.users_registered,
  participants: data.participants,
  slotId: data.slot_id,
  gameId: data.game_id,
  participantCount: data.participant_count,
  eventStatus: data.event_status,
});

export const createEventsApi = (http: AxiosInstance): IEventsApi => ({
  getEvents: async (month) => {
    const { data } = await http.get<CalendarEventPayload[]>(
      '/calendar/payed_events',
      { params: { month: toDateParam(month) } },
    );
    return data.map((event) => ({
      id: event.id,
      title: event.title,
      datetime: new Date(event.datetime),
    }));
  },

  getEvent: async (reservId) => {
    const { data } = await http.get<EventPayload>(`/events/${reservId}`);
    return fromPayload(data);
  },

  joinEvent: async (reservId, userId) => {
    const { data } = await http.put<EventPayload>(
      `/events/${reservId}`,
      undefined,
      { params: { user_id: userId } },
    );
    return fromPayload(data);
  },
});
