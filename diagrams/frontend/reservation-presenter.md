<div hidden>

```
@startuml reservation-presenter
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU2 Rezerwacja czasu dla gry - presenter (planowany, bez implementacji)

interface IReservationActions <<interface>> {
    + onOpenReservation(slot: CalendarEventDTO | null)
    + onChangeParameter(field: string, value: any)
    + onSubmitReservation()
    + onConfirmReservation()
    + onCancelReservation()
    + onPayLater()
    + onPaymentCompletedMessageDialogConfirm()
    + onSlotUnavailableMessageDialogConfirm()
    + onReservationCancelledMessageDialogConfirm()
}

interface IReservationWindows <<interface>> {
    + showReservationView()
    + showReservationConfirmDialog()
    + showPaymentCompletedMessageDialog()
    + showSlotUnavailableMessageDialog()
    + showReservationCancelledMessageDialog()
}

class useReservation <<Hook>> {
    - createReservation()
    - cancelReservation()
}

class ReservationViewModel <<State>> {
    + selectedSlot: CalendarEventDTO | null
    + participantCount: number
    + activeReservation: ReservationSummaryDTO | null
    + paymentUrl: string | null
    + isProcessing: boolean
    + dialogType: ReservationDialogTypes | null
    + errorMessage: string | null
}

enum ReservationDialogTypes {
    confirmation
    paymentCompleted
    slotUnavailable
    reservationCancelled
}

interface IReservationsApi <<interface>>
class CalendarEventDTO <<DTO>>
class ReservationSummaryDTO <<DTO>>
class ReservationCreateDTO <<DTO>>

useReservation .u.|> IReservationActions
useReservation -u-> IReservationWindows
useReservation *-- "1" ReservationViewModel : state
ReservationViewModel ..> ReservationDialogTypes
ReservationViewModel ..> CalendarEventDTO : selectedSlot
ReservationViewModel ..> ReservationSummaryDTO : activeReservation
useReservation ..> ReservationCreateDTO
useReservation --> IReservationsApi : apiClient.reservations\ncreateReservation, cancelReservation

note right of useReservation
    Projekt z PR #72 - frontend PU2 nie jest jeszcze
    zaimplementowany. Backend PU2 jest gotowy
    (POST /reservations, DELETE /reservations/{id}).
end note

note bottom of IReservationsApi
    DTO i porty API: interfaces.md
end note
@enduml
```

</div>

![](rendered/reservation-presenter.svg)
