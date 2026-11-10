import { useState } from 'react';
import { useLocation, useNavigate, type NavigateFunction } from 'react-router';
import { ApiError } from '@api/apiError';
import { apiClient } from '@api/apiClient';
import { env } from '@config/env';
import type { CalendarEventDTO } from '@app-types/calendar';
import type {
  IReservationsActions,
  IReservationsWindows,
  ReservationDialogType,
  ReservationViewModel,
} from '@app-types/reservation';

const RESERVATION_PATH = '/reservations';
const CALENDAR_PATH = '/calendar';

const initialState: ReservationViewModel = {
  selectedSlot: null,
  participantCount: 1,
  activeReservation: null,
  paymentUrl: null,
  isProcessing: false,
  dialogType: null,
  errorMessage: null,
};

function getSelectedSlot(locationState: unknown): CalendarEventDTO | null {
  if (
    !locationState ||
    typeof locationState !== 'object' ||
    !('selectedSlot' in locationState)
  ) {
    return null;
  }

  const slot = locationState.selectedSlot;
  if (
    !slot ||
    typeof slot !== 'object' ||
    !('id' in slot) ||
    typeof slot.id !== 'string' ||
    !('title' in slot) ||
    typeof slot.title !== 'string' ||
    !('datetime' in slot)
  ) {
    return null;
  }

  const datetime =
    slot.datetime instanceof Date
      ? slot.datetime
      : new Date(String(slot.datetime));
  if (Number.isNaN(datetime.getTime())) return null;

  return { id: slot.id, title: slot.title, datetime };
}

function createReservationsWindows(
  navigate: NavigateFunction,
  setDialogType: (dialogType: ReservationDialogType | null) => void,
): IReservationsWindows {
  return {
    showReservationView: (slot) =>
      void navigate(RESERVATION_PATH, { state: { selectedSlot: slot } }),
    showReservationConfirmDialog: () => setDialogType('confirmation'),
    showPaymentCompletedMessageDialog: () => setDialogType('paymentCompleted'),
    showSlotUnavailableMessageDialog: () => setDialogType('slotUnavailable'),
    showReservationCancelledMessageDialog: () =>
      setDialogType('reservationCancelled'),
  };
}

export function useReservations(): {
  state: ReservationViewModel;
  actions: IReservationsActions;
} {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedSlot = getSelectedSlot(location.state);
  const [state, setState] = useState<ReservationViewModel>(() => ({
    ...initialState,
    selectedSlot,
  }));
  const windows = createReservationsWindows(navigate, (dialogType) =>
    setState((prev) => ({ ...prev, dialogType })),
  );

  const createReservation = async () => {
    if (
      !selectedSlot ||
      !Number.isInteger(state.participantCount) ||
      state.participantCount < 1
    ) {
      setState((prev) => ({
        ...prev,
        errorMessage: 'Wybierz termin i podaj co najmniej jednego uczestnika.',
      }));
      return null;
    }

    setState((prev) => ({ ...prev, isProcessing: true, errorMessage: null }));
    try {
      const reservation = await apiClient.reservations.createReservation(
        env.devUserId,
        {
          slotId: selectedSlot.id,
          participantCount: state.participantCount,
        },
      );
      setState((prev) => ({
        ...prev,
        activeReservation: reservation,
        dialogType: null,
        isProcessing: false,
      }));
      return reservation;
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setState((prev) => ({ ...prev, isProcessing: false }));
        windows.showSlotUnavailableMessageDialog();
      } else {
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          errorMessage:
            'Nie udało się utworzyć rezerwacji. Sprawdź dane i spróbuj ponownie.',
        }));
      }
      return null;
    }
  };

  const onStartPayment = async (reservationId: string) => {
    setState((prev) => ({ ...prev, isProcessing: true, errorMessage: null }));
    try {
      const reservation = await apiClient.reservations.markPaymentCompleted(
        reservationId,
        env.devUserId,
      );
      setState((prev) => ({
        ...prev,
        activeReservation: reservation,
        isProcessing: false,
      }));
      windows.showPaymentCompletedMessageDialog();
    } catch {
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        errorMessage:
          'Nie udało się przetworzyć płatności. Rezerwacja nadal oczekuje na płatność.',
      }));
    }
  };

  const onCancelReservation = async () => {
    if (!state.activeReservation) {
      setState((prev) => ({ ...prev, dialogType: null }));
      return;
    }

    setState((prev) => ({ ...prev, isProcessing: true, errorMessage: null }));
    try {
      const cancelled = await apiClient.reservations.cancelReservation(
        state.activeReservation.reservationId,
        env.devUserId,
      );
      if (!cancelled) {
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          errorMessage: 'Nie udało się anulować rezerwacji.',
        }));
        return;
      }
      setState((prev) => ({
        ...prev,
        activeReservation: null,
        isProcessing: false,
      }));
      windows.showReservationCancelledMessageDialog();
    } catch {
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        errorMessage: 'Nie udało się anulować rezerwacji. Spróbuj ponownie.',
      }));
    }
  };

  return {
    state: { ...state, selectedSlot },
    actions: {
      onOpenReservation: windows.showReservationView,
      onChangeParameter: (field, value) => {
        if (field !== 'participantCount') return;
        const participantCount = Number(value);
        setState((prev) => ({
          ...prev,
          participantCount: Number.isFinite(participantCount)
            ? participantCount
            : 0,
          errorMessage: null,
        }));
      },
      onSubmitReservation: () => {
        if (!selectedSlot) {
          setState((prev) => ({
            ...prev,
            errorMessage: 'Nie wybrano terminu. Wróć do kalendarza.',
          }));
          return;
        }
        if (
          !Number.isInteger(state.participantCount) ||
          state.participantCount < 1
        ) {
          setState((prev) => ({
            ...prev,
            errorMessage: 'Liczba uczestników musi wynosić co najmniej 1.',
          }));
          return;
        }
        windows.showReservationConfirmDialog();
      },
      onConfirmReservation: () => void createReservation(),
      onCancelReservation: () => void onCancelReservation(),
      onPayLater: () => void navigate(CALENDAR_PATH),
      onPaymentCompletedMessageDialogConfirm: () =>
        setState((prev) => ({ ...prev, dialogType: null })),
      onSlotUnavailableMessageDialogConfirm: () =>
        setState((prev) => ({
          ...prev,
          dialogType: null,
          errorMessage:
            'Ten termin został już zarezerwowany. Wybierz inny termin w kalendarzu.',
        })),
      onReservationCancelledMessageDialogConfirm: () =>
        setState((prev) => ({ ...prev, dialogType: null })),
      onStartPayment: (reservationId) => void onStartPayment(reservationId),
      onBack: () => void navigate(CALENDAR_PATH),
    },
  };
}
