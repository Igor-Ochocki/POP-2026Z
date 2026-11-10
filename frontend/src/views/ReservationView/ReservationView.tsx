import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Button from '@components/Button/Button';
import MessageDialog from '@components/MessageDialog/MessageDialog';
import { useCalendar } from '@hooks/useCalendar';
import { useReservation } from '@hooks/useReservation';
import { ReservationPanel } from './ReservationPanel';
import './ReservationView.css';

const dialogContent = {
  paymentCompleted: {
    title: 'Płatność zakończona',
    message: 'Rezerwacja została potwierdzona. Dziękujemy za płatność.',
  },
  slotUnavailable: {
    title: 'Termin niedostępny',
    message: 'Wybrany termin został już zarezerwowany.',
  },
  reservationCancelled: {
    title: 'Rezerwacja anulowana',
    message: 'Rezerwacja została anulowana, a termin zwolniony.',
  },
} as const;

export function ReservationView() {
  const { state, actions } = useReservation();
  const calendar = useCalendar();
  const message =
    state.dialogType && state.dialogType !== 'confirmation'
      ? dialogContent[state.dialogType]
      : null;

  return (
    <main className='reservation-page'>
      <header className='reservation-page__header'>
        <h1>Rezerwacja czasu</h1>
        <Button
          variant='secondary'
          aria-label='Powrót do kalendarza'
          onClick={calendar.actions.onShowCalendar}
        >
          <ChevronLeftIcon fontSize='large' />
        </Button>
      </header>

      {state.errorMessage && (
        <p className='reservation-page__error' role='alert'>
          {state.errorMessage}
        </p>
      )}

      <ReservationPanel
        selectedSlot={state.selectedSlot}
        canPickSlot={state.canPickSlot}
        slotDate={state.slotDate}
        availableSlots={state.availableSlots}
        participantCount={state.participantCount}
        activeReservation={state.activeReservation}
        isProcessing={state.isProcessing}
        dialogOpen={state.dialogType === 'confirmation'}
        onChangeParameter={actions.onChangeParameter}
        onSubmitReservation={actions.onSubmitReservation}
        onConfirmReservation={actions.onConfirmReservation}
        onCancelReservation={actions.onCancelReservation}
        onPayLater={calendar.actions.onShowCalendar}
        onStartPayment={actions.onStartPayment}
      />

      {message && (
        <MessageDialog
          title={message.title}
          message={message.message}
          open
          onClosed={() => {
            if (state.dialogType === 'paymentCompleted') {
              actions.onPaymentCompletedMessageDialogConfirm();
            } else if (state.dialogType === 'slotUnavailable') {
              actions.onSlotUnavailableMessageDialogConfirm();
            } else if (state.dialogType === 'reservationCancelled') {
              actions.onReservationCancelledMessageDialogConfirm();
            }
          }}
        />
      )}
    </main>
  );
}
