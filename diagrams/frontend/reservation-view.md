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
    +render()
}

class ReservationFormPanel {
    +onGameChange(gameId: string)
    +onTimeSlotChange(slotId: string)
    +onParticipantCountChange(participantCount: number)
    +onSubmitReservationClick()
    +onCancelClick()
}

class ReservationConfirmDialog {
    +onConfirmClick()
    +onCancelClick()
}

class PaymentPanel {
    +onPayClick()
    +onPayLaterClick()
}

class MessageDialog {
    +onOkClick()
}

class PaymentCompletedMessageDialog
class SlotUnavailableMessageDialog

PaymentCompletedMessageDialog -u-|> MessageDialog
SlotUnavailableMessageDialog -u-|> MessageDialog

interface ICalendarActions <<interface>> {
    +onReserveEventClick()
    +onSelectTimeSlot(slotId: string)
    +onParticipantCountChange(participantCount: number)
    +onConfirmReservation()
    +onCancelReservation()
    +onProceedToPayment()
    +onPay()
    +onPayLater()
    +onPaymentCompletedMessageDialogConfirm()
    +onSlotUnavailableMessageDialogConfirm()
}

interface ICalendarWindows <<interface>> {
    +showReservationView()
    +showReservationConfirmDialog()
    +showPaymentView()
    +showPaymentCompletedMessageDialog()
    +showSlotUnavailableMessageDialog()
}

class CalendarWindows {
    +showReservationView()
    +showReservationConfirmDialog()
    +showPaymentView()
    +showPaymentCompletedMessageDialog()
    +showSlotUnavailableMessageDialog()
}

CalendarWindows .u.|> ICalendarWindows
CalendarWindows --> ReservationView : displays

CalendarView ..> ReservationView : opens from reserve button
CalendarView ..> ReservationView : opens from calendar slot

ReservationView *-- ReservationFormPanel : contains
ReservationView -- ReservationConfirmDialog : displays
ReservationView -- PaymentPanel : displays
ReservationView -- PaymentCompletedMessageDialog : displays
ReservationView -- SlotUnavailableMessageDialog : displays

ReservationFormPanel ..> ICalendarActions : dispatches actions
ReservationConfirmDialog ..> ICalendarActions : dispatches actions
PaymentPanel ..> ICalendarActions : dispatches actions
PaymentCompletedMessageDialog ..> ICalendarActions : dispatches actions
SlotUnavailableMessageDialog ..> ICalendarActions : dispatches actions

note right of ReservationView
    One view for the reservation flow.
    State changes trigger re-rendering.
    No show() parameters are required.
end note

note right of CalendarView
    PU1 owns the calendar.
    
    Entry paths:
    - Reserve button: no selected slot
    - Calendar slot: selected slot passed
      to the reservation Hook
end note

note bottom of PaymentPanel
    Pay now:
    The Hook calls the backend payment endpoint
    after the payment flow succeeds.

    Pay later:
    Keep the reservation unpaid.
    Do not call the payment endpoint.
end note

@enduml

```

</div>

![](rendered/reservation-view.svg)
