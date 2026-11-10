import { useEffect, useRef, useState, type FormEvent } from 'react';
import Button from '@components/Button/Button';
import type {
  IReservationActions,
  ReservationSummaryDTO,
} from '@app-types/reservation';
import type { CalendarEventDTO } from '@app-types/calendar';

interface ReservationPanelProps {
  selectedSlot: CalendarEventDTO;
  participantCount: number;
  activeReservation: ReservationSummaryDTO | null;
  isProcessing: boolean;
  dialogOpen: boolean;
  onChangeParameter: IReservationActions['onChangeParameter'];
  onSubmitReservation: IReservationActions['onSubmitReservation'];
  onConfirmReservation: IReservationActions['onConfirmReservation'];
  onCancelReservation: IReservationActions['onCancelReservation'];
  // "Zapłać później" - powrót do kalendarza przez prezenter PU1.
  onPayLater: () => void;
  onStartPayment: IReservationActions['onStartPayment'];
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(amount);

export function ReservationPanel({
  selectedSlot,
  participantCount,
  activeReservation,
  isProcessing,
  dialogOpen,
  onChangeParameter,
  onSubmitReservation,
  onConfirmReservation,
  onCancelReservation,
  onPayLater,
  onStartPayment,
}: ReservationPanelProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [confirmCancellation, setConfirmCancellation] = useState(false);
  const isDialogOpen = dialogOpen || confirmCancellation;

  useEffect(() => {
    if (isDialogOpen) {
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [isDialogOpen]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmitReservation();
  };

  const closeDialog = () => {
    if (confirmCancellation) {
      setConfirmCancellation(false);
    } else {
      onCancelReservation();
    }
  };

  const confirmDialogAction = () => {
    if (confirmCancellation) {
      setConfirmCancellation(false);
      onCancelReservation();
    } else {
      onConfirmReservation();
    }
  };

  return (
    <section
      className='reservation-panel'
      aria-labelledby='reservation-panel-title'
    >
      <h2 id='reservation-panel-title'>Rezerwacja terminu</h2>
      <dl className='reservation-panel__details'>
        <div>
          <dt>Gra</dt>
          <dd>{selectedSlot.title}</dd>
        </div>
        <div>
          <dt>Termin</dt>
          <dd>{formatDate(selectedSlot.datetime)}</dd>
        </div>
      </dl>

      {activeReservation ? (
        <div className='reservation-panel__summary' aria-live='polite'>
          <h3>Rezerwacja utworzona</h3>
          <p>
            Uczestnicy: <strong>{activeReservation.participantCount}</strong>
          </p>
          <p>
            Do zapłaty:{' '}
            <strong>{formatCurrency(activeReservation.totalCost)}</strong>
          </p>
          <p>
            Status:{' '}
            <strong>
              {activeReservation.isPaid ? 'Opłacona' : 'Oczekuje na płatność'}
            </strong>
          </p>
          <div className='reservation-panel__actions'>
            {!activeReservation.isPaid && (
              <>
                <Button
                  disabled={isProcessing}
                  onClick={() =>
                    onStartPayment(activeReservation.reservationId)
                  }
                >
                  Zapłać teraz
                </Button>
                <Button
                  variant='secondary'
                  disabled={isProcessing}
                  onClick={onPayLater}
                >
                  Zapłać później
                </Button>
                <Button
                  variant='danger'
                  disabled={isProcessing}
                  onClick={() => setConfirmCancellation(true)}
                >
                  Anuluj rezerwację
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <form className='reservation-panel__form' onSubmit={handleSubmit}>
          <label className='reservation-panel__field'>
            <span>Liczba uczestników</span>
            <input
              className='input'
              type='number'
              min='1'
              step='1'
              required
              value={participantCount}
              onChange={(event) =>
                onChangeParameter('participantCount', event.currentTarget.value)
              }
            />
          </label>
          <Button type='submit' disabled={isProcessing}>
            Zarezerwuj termin
          </Button>
        </form>
      )}

      <dialog
        className='reservation-panel__dialog'
        ref={dialog}
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
      >
        <h2>
          {confirmCancellation
            ? 'Anulować rezerwację?'
            : 'Potwierdź rezerwację'}
        </h2>
        <p>
          {confirmCancellation
            ? 'Termin zostanie zwolniony, a rezerwacja anulowana.'
            : `Czy potwierdzasz rezerwację terminu „${selectedSlot.title}” dla ${participantCount} uczestników?`}
        </p>
        <div className='reservation-panel__actions'>
          <Button
            variant='secondary'
            disabled={isProcessing}
            onClick={closeDialog}
          >
            Wróć
          </Button>
          <Button disabled={isProcessing} onClick={confirmDialogAction}>
            {isProcessing
              ? 'Przetwarzanie…'
              : confirmCancellation
                ? 'Anuluj rezerwację'
                : 'Potwierdź'}
          </Button>
        </div>
      </dialog>
    </section>
  );
}
