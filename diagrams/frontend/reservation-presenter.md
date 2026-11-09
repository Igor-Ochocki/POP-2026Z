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

class useReservations <<Hook>> {
    + onOpenReservation(slot: TimeSlotDTO | null)
    + onChangeParameter(field: string, value: unknown)
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
    + onChangeParameter(field: string, value: unknown)
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
    + paymentUrl: string | null
    + isProcessing: boolean
    + dialogType: ReservationDialogType | null
    + errorMessage: string | null
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

enum ReservationDialogType {
    confirmation
    paymentCompleted
    slotUnavailable
    reservationCancelled
}

interface IReservationsApi <<interface>> {
    + createReservation(dto: ReservationCreateDTO): Promise<boolean>
    + cancelReservation(reservationId: string): Promise<boolean>
}

class ReservationCreateDTO <<DTO>> {
    + slotId: string
    + gameId: string
    + participantCount: number
}

class TimeSlotDTO <<PU1 DTO>>

enum ReservationStatus {
    Unpaid
    Confirmed
    Cancelled
}

useReservations .u.|> IReservationsActions
useReservations -u-> IReservationsWindows
useReservations --> IReservationsApi : reservationsApi
useReservations *-- "1" ReservationViewModel : owns state

ReservationViewModel ..> TimeSlotDTO
ReservationViewModel ..> ReservationSummaryDTO

IReservationsApi ..> ReservationCreateDTO

@enduml

```

</div>

![](rendered/reservation-presenter.svg)
