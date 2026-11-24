import { useState } from 'react';
import { ApiError } from '@api/apiError';
import { apiClient } from '@api/apiClient';
import { env } from '@config/env';
import type {
  EventJoinDialogTypes,
  EventJoinViewModel,
  IEventJoinActions,
  IEventJoinWindows,
} from '@app-types/event';

const initialState: EventJoinViewModel = {
  selectedEvent: null,
  eventDetails: null,
  dialogType: null,
};

function createEventJoinWindows(
  setDialogType: (dialogType: EventJoinDialogTypes | null) => void,
): IEventJoinWindows {
  return {
    showEventJoinConfirmDialog: () => setDialogType('confirmation'),
    showEventJoinedMessageDialog: () => setDialogType('joined'),
    showAlreadyJoinedMessageDialog: () => setDialogType('alreadyJoined'),
    showEventFullMessageDialog: () => setDialogType('eventFull'),
    showEventUnavailableMessageDialog: () => setDialogType('eventUnavailable'),
    showAccountBlockedMessageDialog: () => setDialogType('accountBlocked'),
    hideDialogs: () => setDialogType(null),
  };
}

export function useEventJoin(): {
  state: EventJoinViewModel;
  actions: IEventJoinActions;
} {
  const [state, setState] = useState<EventJoinViewModel>(initialState);
  const windows = createEventJoinWindows((dialogType) =>
    setState((prev) => ({ ...prev, dialogType })),
  );

  const openEventJoin = async (event: {
    id: string;
    title: string;
    datetime: Date;
  }) => {
    try {
      const eventDetails = await apiClient.events.getEvent(event.id);
      setState({
        selectedEvent: event,
        eventDetails,
        dialogType: 'confirmation',
      });
    } catch {
      setState({ selectedEvent: event, eventDetails: null, dialogType: null });
      windows.showEventUnavailableMessageDialog();
    }
  };

  const joinEvent = async () => {
    if (!state.selectedEvent) {
      windows.hideDialogs();
      return;
    }

    const reservId = state.selectedEvent.id;
    try {
      // The backend answers 409 for a full, a finished and an already joined
      // event alike, so the state is checked here first.
      const event = await apiClient.events.getEvent(reservId);
      if (event.participants.includes(env.devUserId)) {
        windows.showAlreadyJoinedMessageDialog();
      } else if (event.eventStatus !== 'open') {
        windows.showEventUnavailableMessageDialog();
      } else if (event.usersRegistered >= event.participantCount) {
        windows.showEventFullMessageDialog();
      } else {
        await apiClient.events.joinEvent(reservId, env.devUserId);
        windows.showEventJoinedMessageDialog();
      }
    } catch (error) {
      const status = error instanceof ApiError ? error.status : null;
      if (status === 409) windows.showEventFullMessageDialog();
      else if (status === 403) windows.showAccountBlockedMessageDialog();
      else windows.showEventUnavailableMessageDialog();
    }
  };

  return {
    state,
    actions: {
      onOpenEventJoin: (event) => void openEventJoin(event),
      onConfirmJoin: () => void joinEvent(),
      onCancelJoin: windows.hideDialogs,
      onEventJoinedMessageDialogConfirm: windows.hideDialogs,
      onAlreadyJoinedMessageDialogConfirm: windows.hideDialogs,
      onEventFullMessageDialogConfirm: windows.hideDialogs,
      onEventUnavailableMessageDialogConfirm: windows.hideDialogs,
      onAccountBlockedMessageDialogConfirm: windows.hideDialogs,
    },
  };
}
