<div hidden>

```

@startuml reservation-view
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
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
    One reservation view for the whole flow.
    UI elements render from Hook state.
    
    No show() parameters are needed.
end note

note right of CalendarView
    PU1 owns the calendar.
    
    Entry paths:
    - Reserve button: no initial slot
    - Calendar slot: selected slot supplied
      to the reservation Hook as initial state
end note

note bottom of PaymentPanel
    The organizer can pay now or later.
    Choosing pay later leaves payment
    status as UNPAID.
end note

@enduml
```

</div>

![](rendered/reservation-view.svg)
