import type { CalendarEventDTO } from '@app-types/calendar';

export type EventStatus = 'open' | 'finished' | 'cancelled' | 'restricted';

export type EventJoinDialogTypes =
  | 'confirmation'
  | 'joined'
  | 'alreadyJoined'
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

export interface EventJoinViewModel {
  selectedEvent: CalendarEventDTO | null;
  // Details loaded from the backend when the join dialog opens.
  eventDetails: EventDTO | null;
  dialogType: EventJoinDialogTypes | null;
}

export interface IEventJoinActions {
  onOpenEventJoin(event: CalendarEventDTO): void;
  onConfirmJoin(): void;
  onCancelJoin(): void;
  onEventJoinedMessageDialogConfirm(): void;
  onAlreadyJoinedMessageDialogConfirm(): void;
  onEventFullMessageDialogConfirm(): void;
  onEventUnavailableMessageDialogConfirm(): void;
  onAccountBlockedMessageDialogConfirm(): void;
}

export interface IEventJoinWindows {
  showEventJoinConfirmDialog(): void;
  showEventJoinedMessageDialog(): void;
  showAlreadyJoinedMessageDialog(): void;
  showEventFullMessageDialog(): void;
  showEventUnavailableMessageDialog(): void;
  showAccountBlockedMessageDialog(): void;
  hideDialogs(): void;
}
