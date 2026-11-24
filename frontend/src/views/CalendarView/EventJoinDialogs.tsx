import ConfirmDialog from '@components/ConfirmDialog/ConfirmDialog';
import MessageDialog from '@components/MessageDialog/MessageDialog';
import type { EventJoinViewModel, IEventJoinActions } from '@app-types/event';

const dialogContent = {
  joined: {
    title: 'Dołączono do wydarzenia',
    message: 'Twoja obecność została zarejestrowana.',
  },
  alreadyJoined: {
    title: 'Już jesteś zapisany',
    message: 'Twoja obecność w tym wydarzeniu jest już zarejestrowana.',
  },
  eventFull: {
    title: 'Brak wolnych miejsc',
    message: 'Osiągnięto maksymalną liczbę uczestników wydarzenia.',
  },
  eventUnavailable: {
    title: 'Wydarzenie niedostępne',
    message: 'Nie można dołączyć do tego wydarzenia.',
  },
  accountBlocked: {
    title: 'Konto zablokowane',
    message: 'Twoje konto jest zablokowane, nie możesz dołączyć do wydarzenia.',
  },
} as const;

const statusLabels = {
  open: 'otwarte',
  finished: 'zakończone',
  cancelled: 'odwołane',
  restricted: 'ograniczone',
} as const;

interface EventJoinDialogsProps {
  state: EventJoinViewModel;
  actions: IEventJoinActions;
  // Called after a message is closed, e.g. to refresh the event list.
  onMessageClosed: () => void;
}

export function EventJoinDialogs({
  state,
  actions,
  onMessageClosed,
}: EventJoinDialogsProps) {
  const { dialogType, selectedEvent, eventDetails } = state;
  const message =
    dialogType && dialogType !== 'confirmation'
      ? dialogContent[dialogType]
      : null;

  const confirmationMessage =
    selectedEvent && eventDetails
      ? `${selectedEvent.title}, ${selectedEvent.datetime.toLocaleString('pl-PL')}. ` +
        `Status: ${statusLabels[eventDetails.eventStatus]}. ` +
        `Uczestnicy: ${eventDetails.usersRegistered}/${eventDetails.participantCount}. ` +
        'Czy chcesz dołączyć do wydarzenia?'
      : '';

  const closeMessage = () => {
    if (dialogType === 'joined') {
      actions.onEventJoinedMessageDialogConfirm();
    } else if (dialogType === 'alreadyJoined') {
      actions.onAlreadyJoinedMessageDialogConfirm();
    } else if (dialogType === 'eventFull') {
      actions.onEventFullMessageDialogConfirm();
    } else if (dialogType === 'eventUnavailable') {
      actions.onEventUnavailableMessageDialogConfirm();
    } else if (dialogType === 'accountBlocked') {
      actions.onAccountBlockedMessageDialogConfirm();
    }
    onMessageClosed();
  };

  return (
    <>
      <ConfirmDialog
        title='Dołączenie do wydarzenia'
        message={confirmationMessage}
        open={dialogType === 'confirmation'}
        onClosed={(confirmed) => {
          if (dialogType !== 'confirmation') return;
          if (confirmed) actions.onConfirmJoin();
          else actions.onCancelJoin();
        }}
      />

      {message && (
        <MessageDialog
          title={message.title}
          message={message.message}
          open
          onClosed={closeMessage}
        />
      )}
    </>
  );
}
