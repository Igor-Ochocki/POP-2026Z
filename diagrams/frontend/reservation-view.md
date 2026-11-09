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

title PU2 Rezerwacja czasu dla gry - widok (planowany, bez implementacji)

class ReservationView <<View>>

class ReservationPanel <<View>> {
    + onParticipantCountChange(value: number)
    + onSubmitReservationClick()
    + onConfirmClick()
    + onCancelClick()
    + onPayLaterClick()
    + onPayNowClick()
}

class MessageDialog {
    + show(title: string, message: string)
    + onOkClick()
}

class ConfirmDialog {
    + show(title: string, message: string)
    + onConfirmClick()
    + onCancelClick()
}

class ReservationWindows
interface IReservationWindows <<interface>>
interface IReservationActions <<interface>>
class ReservationViewModel <<State>>
interface IPaymentActions <<interface>>
class CalendarView <<View>>

ReservationWindows .u.|> IReservationWindows
ReservationWindows --> ReservationView
ReservationWindows --> ConfirmDialog
ReservationWindows --> MessageDialog

CalendarView --> IReservationActions : wybór terminu - onOpenReservation (PU1)
ReservationView *-- ReservationPanel
ReservationView --> ReservationViewModel
ReservationPanel --> IReservationActions
ConfirmDialog --> IReservationActions : onConfirmReservation
MessageDialog --> IReservationActions
ReservationPanel --> IPaymentActions : "Zapłać teraz" (PU61)
@enduml
```

</div>

![](rendered/reservation-view.svg)
