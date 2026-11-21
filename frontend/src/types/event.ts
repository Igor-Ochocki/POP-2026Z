import type { CalendarEventDTO } from '@app-types/calendar';

export type EventStatus = 'open' | 'finished' | 'cancelled' | 'restricted';

export type EventJoinDialogTypes =
  | 'confirmation'
  | 'joined'
  | 'eventFull'
  | 'eventUnavailable'
  | 'accountBlocked';

export interface EventDTO {
  reservId: string;
  usersRegistered: number;
  participants: string[];
  slotId: string;
  gameId: string;
  participantCount: number;
  eventStatus: EventStatus;
}

export interface EventListViewModel {
  events: CalendarEventDTO[];
  errorMessage: string | null;
}

export interface IEventListActions {
  onOpenEventList(): void;
}

export interface EventJoinViewModel {
  selectedEvent: CalendarEventDTO | null;
  dialogType: EventJoinDialogTypes | null;
}

export interface IEventJoinActions {
  onOpenEventJoin(event: CalendarEventDTO): void;
  onConfirmJoin(): void;
  onCancelJoin(): void;
  onEventJoinedMessageDialogConfirm(): void;
  onEventFullMessageDialogConfirm(): void;
  onEventUnavailableMessageDialogConfirm(): void;
  onAccountBlockedMessageDialogConfirm(): void;
}

export interface IEventJoinWindows {
  showEventJoinConfirmDialog(): void;
  showEventJoinedMessageDialog(): void;
  showEventFullMessageDialog(): void;
  showEventUnavailableMessageDialog(): void;
  showAccountBlockedMessageDialog(): void;
  hideDialogs(): void;
}
