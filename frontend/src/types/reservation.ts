import type { CalendarEventDTO } from '@app-types/calendar';

export type ReservationStatus = 'unpaid' | 'confirmed' | 'cancelled';

export type ReservationDialogType =
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
  participantCount: number;
  activeReservation: ReservationSummaryDTO | null;
  paymentUrl: string | null;
  isProcessing: boolean;
  dialogType: ReservationDialogType | null;
  errorMessage: string | null;
}

export interface IReservationsActions {
  onOpenReservation(slot: CalendarEventDTO | null): void;
  onChangeParameter(field: string, value: unknown): void;
  onSubmitReservation(): void;
  onConfirmReservation(): void;
  onCancelReservation(): void;
  onPayLater(): void;
  onPaymentCompletedMessageDialogConfirm(): void;
  onSlotUnavailableMessageDialogConfirm(): void;
  onReservationCancelledMessageDialogConfirm(): void;
  onStartPayment(reservationId: string): void;
  onBack(): void;
}

export interface IReservationsWindows {
  showReservationView(slot: CalendarEventDTO | null): void;
  showReservationConfirmDialog(): void;
  showPaymentCompletedMessageDialog(): void;
  showSlotUnavailableMessageDialog(): void;
  showReservationCancelledMessageDialog(): void;
}
