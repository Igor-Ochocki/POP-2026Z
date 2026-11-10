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

title PU2 Rezerwacja czasu dla gry - presenter

interface IReservationActions <<interface>> {
    + onOpenReservation(slot: CalendarEventDTO)
    + onChangeParameter(field: string, value: any)
    + onSubmitReservation()
    + onConfirmReservation()
    + onCancelReservation()
    + onStartPayment(reservationId: string)
    + onPaymentCompletedMessageDialogConfirm()
    + onSlotUnavailableMessageDialogConfirm()
    + onReservationCancelledMessageDialogConfirm()
}

interface IReservationWindows <<interface>> {
    + showReservationView(slot: CalendarEventDTO)
    + showReservationConfirmDialog()
    + showPaymentCompletedMessageDialog()
    + showSlotUnavailableMessageDialog()
    + showReservationCancelledMessageDialog()
    + hideDialogs()
}

class useReservation <<Hook>> {
    - getSelectedSlot(locationState: unknown): CalendarEventDTO | null
    - createReservation()
    - startPayment(reservationId: string)
    - cancelReservation()
}

class ReservationViewModel <<State>> {
    + selectedSlot: CalendarEventDTO | null
    + participantCount: number
    + activeReservation: ReservationSummaryDTO | null
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
useReservation --> IReservationsApi : apiClient.reservations\ncreateReservation, cancelReservation,\nmarkPaymentCompleted

note right of useReservation
    Trasa /reservations - wybrany termin przychodzi w danych nawigacji
    (showReservationView(slot)); bez terminu widok prosi o powrót do kalendarza.
    Hook nie wywołuje API przy montowaniu, więc CalendarView może go użyć
    do onOpenReservation.
    onSubmitReservation: liczba uczestników >= 1, inaczej errorMessage.
    onConfirmReservation: createReservation; 409 -> showSlotUnavailableMessageDialog,
    inny błąd (np. 400 - liczba spoza zakresu gry) -> errorMessage.
    onStartPayment: mock płatności (POST /reservations/{id}/payment).
end note

note bottom of IReservationsApi
    DTO i porty API: interfaces.md
end note
@enduml
```

</div>

![](rendered/reservation-presenter.svg)
