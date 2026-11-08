<div hidden>

```

@startuml reservation-view

skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam nodesep 26
skinparam ranksep 34
skinparam linetype polyline

title PU2 - Game Time Reservation - View

class CalendarView <<External PU1>>

class ReservationView {
    + render()
}

class ReservationPanel {
    + onSubmitReservationClick()
    + onConfirmClick()
    + onCancelClick()
}

class PaymentPanel {
    + onPayClick()
    + onPayLaterClick()
}

class MessageDialog {
    + show(title: string, message: string)
    + onOkClick()
}

interface IReservationsActions <<interface>> {
    + onOpenReservation(slot: TimeSlotDTO | null)
    + onChangeParameter(field: string, value: unknown)
    + onSubmitReservation()
    + onConfirmReservation()
    + onCancelReservation()
    + onPayLater()
    + onMessageDialogConfirm()
}

interface IPaymentActions <<interface>> {
    + onPay(reservationId: string)
}

interface IReservationsWindows <<interface>> {
    + showReservationView()
    + showMessageDialog(title: string, message: string)
}

class ReservationsWindows {
    + showReservationView()
    + showMessageDialog(title: string, message: string)
}

ReservationsWindows .u.|> IReservationsWindows

ReservationView --> ReservationPanel : displays
ReservationView --> PaymentPanel : displays
ReservationView --> MessageDialog : displays

ReservationPanel ..> IReservationsActions : dispatches actions
PaymentPanel ..> IReservationsActions : pay later
PaymentPanel ..> IPaymentActions : pay now
MessageDialog ..> IReservationsActions : confirms

ReservationsWindows --> ReservationView

note right of CalendarView
    External PU1.
    Navigation is handled by PU1 Presenter.
end note

note bottom of PaymentPanel
    Pay now -> IPaymentActions.onPay()
    Pay later -> IReservationsActions.onPayLater()
end note

@enduml

```

</div>

![](rendered/reservation-view.svg)
