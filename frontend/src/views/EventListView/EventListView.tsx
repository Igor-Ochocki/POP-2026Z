import Button from '@components/Button/Button';
import ConfirmDialog from '@components/ConfirmDialog/ConfirmDialog';
import MessageDialog from '@components/MessageDialog/MessageDialog';
import PageHeader from '@components/PageHeader/PageHeader';
import TextHeading from '@components/TextHeading/TextHeading';
import TextSubtitle from '@components/TextSubtitle/TextSubtitle';
import { useEventJoin } from '@hooks/useEventJoin';
import { useEventList } from '@hooks/useEventList';
import './EventListView.css';

const dialogContent = {
  joined: {
    title: 'Dołączono do wydarzenia',
    message: 'Twoja obecność została zarejestrowana.',
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

export function EventListView() {
  const { state, actions } = useEventList();
  const join = useEventJoin();
  const { dialogType, selectedEvent } = join.state;
  const message =
    dialogType && dialogType !== 'confirmation'
      ? dialogContent[dialogType]
      : null;

  const onMessageClosed = () => {
    if (dialogType === 'joined') {
      join.actions.onEventJoinedMessageDialogConfirm();
    } else if (dialogType === 'eventFull') {
      join.actions.onEventFullMessageDialogConfirm();
    } else if (dialogType === 'eventUnavailable') {
      join.actions.onEventUnavailableMessageDialogConfirm();
    } else if (dialogType === 'accountBlocked') {
      join.actions.onAccountBlockedMessageDialogConfirm();
    }
    actions.onOpenEventList();
    actions.onLoadEvents();
  };

  return (
    <div className='event-list-view'>
      <PageHeader title='Wydarzenia' />

      {state.errorMessage ? (
        <>
          <TextHeading level={5}>{state.errorMessage}</TextHeading>
          <Button onClick={actions.onLoadEvents}>Spróbuj ponownie</Button>
        </>
      ) : (
        <div className='event-list-list'>
          {state.events.map((event) => (
            <div className='event-list-item' key={event.id}>
              <div>
                <TextHeading level={5}>{event.title}</TextHeading>
                <TextSubtitle>
                  {event.datetime.toLocaleString('pl-PL')}
                </TextSubtitle>
              </div>
              <Button onClick={() => join.actions.onOpenEventJoin(event)}>
                Dołącz
              </Button>
            </div>
          ))}
          {state.events.length === 0 && (
            <TextHeading level={6}>Brak zarejestrowanych wydarzeń</TextHeading>
          )}
        </div>
      )}

      <ConfirmDialog
        title='Dołączenie do wydarzenia'
        message={`Czy chcesz dołączyć do wydarzenia "${selectedEvent?.title ?? ''}"?`}
        open={dialogType === 'confirmation'}
        onClosed={(confirmed) => {
          if (dialogType !== 'confirmation') return;
          if (confirmed) join.actions.onConfirmJoin();
          else join.actions.onCancelJoin();
        }}
      />

      {message && (
        <MessageDialog
          title={message.title}
          message={message.message}
          open
          onClosed={onMessageClosed}
        />
      )}
    </div>
  );
}
