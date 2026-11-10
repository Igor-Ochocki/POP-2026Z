import type { AxiosInstance } from 'axios';
import type {
  ReservationCreateDTO,
  ReservationSummaryDTO,
} from '@app-types/reservation';

export interface IReservationsApi {
  createReservation(
    userId: string,
    dto: ReservationCreateDTO,
  ): Promise<ReservationSummaryDTO>;
  cancelReservation(reservationId: string, userId: string): Promise<boolean>;
  markPaymentCompleted(
    reservationId: string,
    userId: string,
  ): Promise<ReservationSummaryDTO>;
}

interface ReservationCreatePayload {
  slot_id: string;
  participant_count: number;
}

interface ReservationSummaryPayload {
  reservation_id: string;
  slot_id: string;
  game_id: string;
  organizer_id: string;
  participant_count: number;
  total_cost: number;
  status: ReservationSummaryDTO['status'];
  is_paid: boolean;
}

const toCreatePayload = (
  dto: ReservationCreateDTO,
): ReservationCreatePayload => ({
  slot_id: dto.slotId,
  participant_count: dto.participantCount,
});

const fromSummaryPayload = (
  data: ReservationSummaryPayload,
): ReservationSummaryDTO => ({
  reservationId: data.reservation_id,
  slotId: data.slot_id,
  gameId: data.game_id,
  organizerId: data.organizer_id,
  participantCount: data.participant_count,
  totalCost: data.total_cost,
  status: data.status,
  isPaid: data.is_paid,
});

export const createReservationsApi = (
  http: AxiosInstance,
): IReservationsApi => ({
  createReservation: async (userId, dto) => {
    const { data } = await http.post<ReservationSummaryPayload>(
      '/reservations',
      toCreatePayload(dto),
      { params: { user_id: userId } },
    );
    return fromSummaryPayload(data);
  },

  cancelReservation: async (reservationId, userId) => {
    const { data } = await http.delete<boolean>(
      `/reservations/${reservationId}`,
      { params: { user_id: userId } },
    );
    return data;
  },

  markPaymentCompleted: async (reservationId, userId) => {
    const { data } = await http.post<ReservationSummaryPayload>(
      `/reservations/${reservationId}/payment`,
      undefined,
      { params: { user_id: userId } },
    );
    return fromSummaryPayload(data);
  },
});
