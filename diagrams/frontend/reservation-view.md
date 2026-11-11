<div hidden>

```
@startuml reservation-view
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU2 Rezerwacja czasu dla gry - widok

class CalendarView <<View>>

class ReservationView <<View>>

class ReservationPanel <<View>> {
    + handleSubmit(event: FormEvent)
    + closeDialog()
    + confirmDialogAction()
}

class ConfirmDialog {
    + onClosed(confirmed: boolean)
}

class MessageDialog {
    + onClosed()
}

class ReservationConfirmDialog
class CancelReservationConfirmDialog
class PaymentCompletedMessageDialog
class SlotUnavailableMessageDialog
class ReservationCancelledMessageDialog

ReservationConfirmDialog -u-|> ConfirmDialog
CancelReservationConfirmDialog -u-|> ConfirmDialog
PaymentCompletedMessageDialog -u-|> MessageDialog
SlotUnavailableMessageDialog -u-|> MessageDialog
ReservationCancelledMessageDialog -u-|> MessageDialog

class ReservationWindows
interface IReservationWindows <<interface>>
interface IReservationActions <<interface>>
class ReservationViewModel <<State>>
interface ICalendarActions <<interface>>

ReservationWindows .u.|> IReservationWindows
ReservationWindows --> ReservationView
ReservationWindows --> ConfirmDialog
ReservationWindows --> MessageDialog

CalendarView --> IReservationActions : onOpenReservation (PU2)
ReservationView *-- ReservationPanel
ReservationPanel --> CancelReservationConfirmDialog : otwiera (stan lokalny panelu)
ReservationView --> ReservationViewModel
ReservationPanel --> IReservationActions
ReservationConfirmDialog --> IReservationActions : onConfirmReservation
CancelReservationConfirmDialog --> IReservationActions : onCancelReservation
PaymentCompletedMessageDialog --> IReservationActions
SlotUnavailableMessageDialog --> IReservationActions
ReservationCancelledMessageDialog --> IReservationActions
ReservationView --> ICalendarActions : onShowCalendar (PU1)
ReservationPanel --> ICalendarActions : onShowCalendar (PU1)

note right of ReservationPanel
    Bez terminu ("Dodaj wydarzenie") formularz pokazuje datę i listę
    terminów z tego dnia (onChangeParameter slotDate / slotId).
    "Zapłać teraz" -> onStartPayment(reservationId) (mock płatności PU61).
    "Zapłać później" - rezerwacja zostaje nieopłacona (unpaid),
    użytkownik wraca do kalendarza.
    Potwierdzenie anulowania to lokalny dialog panelu;
    pozostałe dialogi otwiera prezenter przez IReservationWindows.
end note
@enduml
```

</div>

![](rendered/reservation-view.svg)
