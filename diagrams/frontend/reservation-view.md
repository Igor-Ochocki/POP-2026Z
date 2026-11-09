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

class ReservationView {
    + render()
}

class ReservationPanel {
    + onSubmitReservationClick()
    + onConfirmClick()
    + onCancelClick()
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
    + onStartPayment(reservationId: string)
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
ReservationView --> MessageDialog : displays
ReservationView ..> IPaymentActions : starts payment

ReservationPanel ..> IReservationsActions : dispatches actions
MessageDialog ..> IReservationsActions : confirms

ReservationsWindows --> ReservationView

@enduml

```

</div>

![](rendered/reservation-view.svg)
