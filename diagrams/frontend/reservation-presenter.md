<div hidden>

```

@startuml reservation-presenter
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline

title PU2 - Game Time Reservation - Presenter

class useCalendar <<Hook>> {
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
    -createReservation()
    -completePayment()
    -cancelReservation()
}

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

class CalendarViewModel <<State>> {
    +selectedGameId: string
    +selectedSlot: TimeSlotDTO [0..1]
    +activeReservation: ReservationSummaryDTO [0..1]
    +participantCount: number
    +isConfirmationDialogOpen: boolean
    +isPaymentViewOpen: boolean
    +isProcessing: boolean
    +errorMessage: string [0..1]
}

interface ReservationsApi <<interface>> {
    +getAvailableSlots(gameId: string, startDate: DateTime, endDate: DateTime): Promise<TimeSlotDTO[*]>
    +createReservation(slotId: string, gameId: string, participantCount: number): Promise<ReservationSummaryDTO>
    +cancelReservation(reservationId: string): Promise<boolean>
}

interface PaymentsApi <<interface>> {
    +pay(reservationId: string): Promise<PaymentStatus>
    +getPaymentStatus(reservationId: string): Promise<PaymentStatus>
}

class CalendarView <<External PU1>>

useCalendar .u.|> ICalendarActions
useCalendar -u-> ICalendarWindows
useCalendar --> ReservationsApi : apiClient.reservations
useCalendar --> PaymentsApi : apiClient.payments
useCalendar *-- "1" CalendarViewModel : owns state

ReservationsApi ..> TimeSlotDTO : returns
ReservationsApi ..> ReservationSummaryDTO : returns
PaymentsApi ..> PaymentStatus : returns

CalendarView ..> ICalendarActions : user actions

note right of CalendarViewModel
    State is owned by the Hook.
    selectedSlot and activeReservation
    are optional and may be null.
    
    View reads this state to render
    the current reservation step.
end note

note right of ICalendarWindows
    Methods change which UI is visible.
    No state parameters are required:
    the view reads state from the Hook.
    
    Calendar-specific windows remain
    the responsibility of PU1.
end note

note bottom of ReservationsApi
    A reservation can be created with
    payment status UNPAID.
    The slot is selected before creation.
    
    If the user starts without a slot,
    they must select an available slot first.
end note

note bottom of PaymentsApi
    Payment is optional during reservation.
    onPayLater keeps the reservation
    confirmed with status UNPAID.
    Successful payment changes status
    to PAID.
end note

@enduml

```

</div>

![](rendered/reservation-presenter.svg)
