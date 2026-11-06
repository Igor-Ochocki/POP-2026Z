<div hidden>

```

@startuml reservation-presenter
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam nodesep 26
skinparam ranksep 34
skinparam linetype polyline

title PU2 - Game Time Reservation - Presenter

' =========================
' Reservation Presenter
' =========================

class useReservations <<Hook>> {
    + onOpenReservation(slot: TimeSlotDTO | null)
    + onChangeParticipantCount(count: number)
    + onSubmitReservation()
    + onConfirmReservation()
    + onCancelReservation()
    + onPayLater()
    + onPaymentCompletedMessageDialogConfirm()
    + onSlotUnavailableMessageDialogConfirm()
    + onReservationCancelledMessageDialogConfirm()
    - createReservation()
    - cancelReservation()
}

interface IReservationsActions <<interface>> {
    + onOpenReservation(slot: TimeSlotDTO | null)
    + onChangeParticipantCount(count: number)
    + onSubmitReservation()
    + onConfirmReservation()
    + onCancelReservation()
    + onPayLater()
    + onPaymentCompletedMessageDialogConfirm()
    + onSlotUnavailableMessageDialogConfirm()
    + onReservationCancelledMessageDialogConfirm()
}

interface IReservationsWindows <<interface>> {
    + showReservationView()
    + showReservationConfirmDialog()
    + showPaymentCompletedMessageDialog()
    + showSlotUnavailableMessageDialog()
    + showReservationCancelledMessageDialog()
}

class ReservationViewModel <<State>> {
    + selectedSlot: TimeSlotDTO | null
    + participantCount: number
    + activeReservation: ReservationSummaryDTO | null
    + isProcessing: boolean
    + dialogType: ReservationDialogType | null
    + errorMessage: string | null
}

enum ReservationDialogType {
    confirmation
    paymentCompleted
    slotUnavailable
    reservationCancelled
}

' =========================
' Payment Presenter
' =========================

class usePayment <<Hook>> {
    + onPay(reservationId: string)
    + onPaymentReturn()
    + onPaymentFailed()
    - startPayment()
    - handlePaymentResult()
    - confirmPayment()
    - navigateAfterPayment()
}

interface IPaymentActions <<interface>> {
    + onPay(reservationId: string)
}

class PaymentViewModel <<State>> {
    + reservationId: string | null
    + paymentStatus: PaymentStatus
    + isRedirecting: boolean
    + errorMessage: string | null
}

enum PaymentStatus {
    Idle
    Pending
    Completed
    Failed
}

' =========================
' API Contracts
' =========================

interface IReservationsApi <<interface>> {
    + createReservation(dto: ReservationCreateDTO): Promise<ReservationSummaryDTO>
    + cancelReservation(reservationId: string): Promise<boolean>
}

interface IPaymentApi <<interface>> {
    + markPaymentCompleted(reservationId: string): Promise<ReservationSummaryDTO>
}

class ReservationsApiClient <<API Client>>
class PaymentApiClient <<API Client>>

' =========================
' DTOs
' =========================

class ReservationCreateDTO <<DTO>> {
    + slotId: string
    + gameId: string
    + participantCount: number
}

class ReservationSummaryDTO <<DTO>> {
    + reservationId: string
    + slotId: string
    + gameId: string
    + organizerId: string
    + participantCount: number
    + totalCost: number
    + status: ReservationStatus
    + isPaid: boolean
}

class TimeSlotDTO <<PU1 DTO>>

enum ReservationStatus {
    Unpaid
    Confirmed
    Cancelled
}

' =========================
' Relationships
' =========================

useReservations .u.|> IReservationsActions
useReservations -u-> IReservationsWindows
useReservations --> IReservationsApi : reservationsApi

useReservations *-- "1" ReservationViewModel : owns state

usePayment .u.|> IPaymentActions
usePayment --> IPaymentApi : paymentApi
usePayment *-- "1" PaymentViewModel : owns state

useReservations ..> IPaymentActions : starts payment
useReservations ..> TimeSlotDTO : receives selected slot

ReservationsApiClient .u.|> IReservationsApi
PaymentApiClient .u.|> IPaymentApi

ReservationsApiClient ..> ReservationCreateDTO : request
ReservationsApiClient ..> ReservationSummaryDTO : response
PaymentApiClient ..> ReservationSummaryDTO : response

ReservationViewModel ..> TimeSlotDTO : stores selected slot
ReservationViewModel ..> ReservationSummaryDTO : stores reservation
ReservationSummaryDTO ..> ReservationStatus

note right of IReservationsApi
    Backend endpoints:

    POST   /api/v1/reservations/
    DELETE /api/v1/reservations/{reservation_id}

    user_id is obtained from JWT.
end note

note right of IPaymentApi
    Backend endpoint:

    POST /api/v1/reservations/{reservation_id}/payment

    Called after verified payment completion.
    Not an endpoint for starting payment.
end note

note bottom of useReservations
    Reservation flow:

    1. Open reservation view.
    2. Receive selected slot.
    3. Enter participant count.
    4. Create reservation (Unpaid).
    5. Display confirmation dialog.
    6. Confirm or cancel reservation.
    7. Pay now -> usePayment.onPay().
    8. Pay later -> keep reservation Unpaid.
end note

note bottom of usePayment
    Payment flow:

    1. Start payment process.
    2. Redirect to payment provider.
    3. Return to application.
    4. Obtain verified payment result.
    5. Confirm payment through backend.
    6. Navigate to reservation result.
end note

note right of ReservationCreateDTO
    Frontend DTO.
    Maps to backend ReservationCreateSchema:

    slotId -> slot_id
    gameId -> game_id
    participantCount -> participant_count
end note

note right of ReservationSummaryDTO
    Frontend DTO.
    Maps to backend ReservationSummarySchema.

    reservationId -> reservation_id
    totalCost -> total_cost
    organizerId -> organizer_id
    isPaid -> is_paid
end note

note bottom of TimeSlotDTO
    Defined in PU1.
    Passed to PU2 when opening reservation.
    Can be null when no slot is selected.
end note

@enduml

```

</div>

![](rendered/reservation-presenter.svg)
