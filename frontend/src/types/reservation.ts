import type { CalendarEventDTO } from '@app-types/calendar';

export type ReservationStatus = 'unpaid' | 'confirmed' | 'cancelled';

export type ReservationDialogTypes =
  | 'confirmation'
  | 'paymentCompleted'
  | 'slotUnavailable'
  | 'reservationCancelled';

export interface ReservationCreateDTO {
  slotId: string;
  participantCount: number;
}

export interface ReservationSummaryDTO {
  reservationId: string;
  slotId: string;
  gameId: string;
  organizerId: string;
  participantCount: number;
  totalCost: number;
  status: ReservationStatus;
  isPaid: boolean;
}

export interface ReservationViewModel {
  selectedSlot: CalendarEventDTO | null;
  // Opened via "Dodaj wydarzenie" - the user picks the slot in the form.
  canPickSlot: boolean;
  // YYYY-MM-DD chosen in the form and the slots offered for that day.
  slotDate: string;
  availableSlots: CalendarEventDTO[];
  participantCount: number;
  activeReservation: ReservationSummaryDTO | null;
  isProcessing: boolean;
  dialogType: ReservationDialogTypes | null;
  errorMessage: string | null;
}

export interface IReservationActions {
  onOpenReservation(slot?: CalendarEventDTO): void;
  onChangeParameter(field: string, value: unknown): void;
  onSubmitReservation(): void;
  onConfirmReservation(): void;
  onCancelReservation(): void;
  onPaymentCompletedMessageDialogConfirm(): void;
  onSlotUnavailableMessageDialogConfirm(): void;
  onReservationCancelledMessageDialogConfirm(): void;
  onStartPayment(reservationId: string): void;
}

export interface IReservationWindows {
  showReservationView(slot?: CalendarEventDTO): void;
  showReservationConfirmDialog(): void;
  showPaymentCompletedMessageDialog(): void;
  showSlotUnavailableMessageDialog(): void;
  showReservationCancelledMessageDialog(): void;
  hideDialogs(): void;
}
