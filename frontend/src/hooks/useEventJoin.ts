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
  dialogType: null,
};

function createEventJoinWindows(
  setDialogType: (dialogType: EventJoinDialogTypes | null) => void,
): IEventJoinWindows {
  return {
    showEventJoinConfirmDialog: () => setDialogType('confirmation'),
    showEventJoinedMessageDialog: () => setDialogType('joined'),
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

  const joinEvent = async () => {
    if (!state.selectedEvent) {
      windows.hideDialogs();
      return;
    }

    const reservId = state.selectedEvent.id;
    try {
      // The backend answers 409 for both a full and a finished event,
      // so the status and free places are checked first.
      const event = await apiClient.events.getEvent(reservId);
      if (event.eventStatus !== 'open') {
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
      onOpenEventJoin: (event) => {
        setState({ selectedEvent: event, dialogType: 'confirmation' });
      },
      onConfirmJoin: () => void joinEvent(),
      onCancelJoin: windows.hideDialogs,
      onEventJoinedMessageDialogConfirm: windows.hideDialogs,
      onEventFullMessageDialogConfirm: windows.hideDialogs,
      onEventUnavailableMessageDialogConfirm: windows.hideDialogs,
      onAccountBlockedMessageDialogConfirm: windows.hideDialogs,
    },
  };
}
