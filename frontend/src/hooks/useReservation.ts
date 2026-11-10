import { useState } from 'react';
import { useLocation, useNavigate, type NavigateFunction } from 'react-router';
import { ApiError } from '@api/apiError';
import { apiClient } from '@api/apiClient';
import { env } from '@config/env';
import type { CalendarEventDTO } from '@app-types/calendar';
import type {
  IReservationActions,
  IReservationWindows,
  ReservationDialogTypes,
  ReservationViewModel,
} from '@app-types/reservation';

const RESERVATION_PATH = '/reservations';

const initialState: ReservationViewModel = {
  selectedSlot: null,
  canPickSlot: false,
  slotDate: '',
  availableSlots: [],
  participantCount: 1,
  activeReservation: null,
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

// YYYY-MM-DD in local time - toISOString() would shift it to UTC.
const toDateValue = (date: Date): string =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

function createReservationWindows(
  navigate: NavigateFunction,
  setDialogType: (dialogType: ReservationDialogTypes | null) => void,
): IReservationWindows {
  return {
    // No slot opens an empty reservation view ("Dodaj wydarzenie").
    showReservationView: (slot) =>
      void navigate(
        RESERVATION_PATH,
        slot ? { state: { selectedSlot: slot } } : undefined,
      ),
    showReservationConfirmDialog: () => setDialogType('confirmation'),
    showPaymentCompletedMessageDialog: () => setDialogType('paymentCompleted'),
    showSlotUnavailableMessageDialog: () => setDialogType('slotUnavailable'),
    showReservationCancelledMessageDialog: () =>
      setDialogType('reservationCancelled'),
    hideDialogs: () => setDialogType(null),
  };
}

export function useReservation(): {
  state: ReservationViewModel;
  actions: IReservationActions;
} {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<ReservationViewModel>(() => {
    const selectedSlot = getSelectedSlot(location.state);
    return { ...initialState, selectedSlot, canPickSlot: !selectedSlot };
  });
  const { selectedSlot } = state;
  const windows = createReservationWindows(navigate, (dialogType) =>
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
        isProcessing: false,
      }));
      windows.hideDialogs();
      return reservation;
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setState((prev) => ({ ...prev, isProcessing: false }));
        windows.showSlotUnavailableMessageDialog();
      } else {
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          // 400 carries the reason, e.g. participant count outside the game's range.
          errorMessage:
            error instanceof ApiError && error.status === 400
              ? error.message
              : 'Nie udało się utworzyć rezerwacji. Sprawdź dane i spróbuj ponownie.',
        }));
        windows.hideDialogs();
      }
      return null;
    }
  };

  const loadSlots = async (slotDate: string) => {
    setState((prev) => ({
      ...prev,
      slotDate,
      selectedSlot: null,
      availableSlots: [],
      errorMessage: null,
    }));
    const [year, month, day] = slotDate.split('-').map(Number);
    if (!year || !month || !day) return;

    try {
      const events = await apiClient.calendar.getEvents(
        new Date(year, month - 1, 1),
      );
      const availableSlots = events
        .filter((event) => toDateValue(event.datetime) === slotDate)
        .sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
      // Ignore responses for a date the user has already changed.
      setState((prev) =>
        prev.slotDate === slotDate ? { ...prev, availableSlots } : prev,
      );
    } catch {
      setState((prev) =>
        prev.slotDate === slotDate
          ? {
              ...prev,
              errorMessage: 'Nie udało się wczytać terminów. Spróbuj ponownie.',
            }
          : prev,
      );
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
      windows.hideDialogs();
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
    state,
    actions: {
      onOpenReservation: windows.showReservationView,
      onChangeParameter: (field, value) => {
        if (field === 'slotDate') {
          void loadSlots(String(value));
          return;
        }
        if (field === 'slotId') {
          setState((prev) => ({
            ...prev,
            selectedSlot:
              prev.availableSlots.find((slot) => slot.id === value) ?? null,
            errorMessage: null,
          }));
          return;
        }
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
            errorMessage: 'Wybierz termin rezerwacji.',
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
      onPaymentCompletedMessageDialogConfirm: windows.hideDialogs,
      onSlotUnavailableMessageDialogConfirm: () => {
        setState((prev) => ({
          ...prev,
          errorMessage:
            'Ten termin został już zarezerwowany. Wybierz inny termin.',
        }));
        windows.hideDialogs();
      },
      onReservationCancelledMessageDialogConfirm: windows.hideDialogs,
      onStartPayment: (reservationId) => void onStartPayment(reservationId),
    },
  };
}
