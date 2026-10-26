<div hidden>

```
@startuml reservation-presenter
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline

title PU2 Rezerwacja czasu dla gry - presenter

class useCalendar <<Hook>> {
    + onReserveEventClick()
    + onSelectTimeSlot(slotId: string)
    + onParticipantCountChange(participantCount: number)
    + onConfirmReservation(participantCount: number)
    + onCancelReservation()
    + onProceedToPayment(reservationId: string)
    + onPay()
    + onPaymentCompletedMessageDialogConfirm()
    + onSlotUnavailableMessageDialogConfirm()
    - createReservation(slotId: string, participantCount: number)
    - completePayment(reservationId: string)
    - cancelReservation(reservationId: string)
}

interface ICalendarActions <<interface>> {
    + onReserveEventClick()
    + onSelectTimeSlot(slotId: string)
    + onParticipantCountChange(participantCount: number)
    + onConfirmReservation(participantCount: number)
    + onCancelReservation()
    + onProceedToPayment(reservationId: string)
    + onPay()
    + onPaymentCompletedMessageDialogConfirm()
    + onSlotUnavailableMessageDialogConfirm()
}

interface ICalendarWindows <<interface>> {
    + showReservationView(slot: TimeSlotDTO)
    + showReservationConfirmDialog(reservation: ReservationSummaryDTO)
    + showPaymentView(reservation: ReservationSummaryDTO)
    + showPaymentCompletedMessageDialog()
    + showSlotUnavailableMessageDialog()
}

class CalendarViewModel <<State>> {
    + selectedGameId: string
    + selectedSlot: TimeSlotDTO
    + activeReservation: ReservationSummaryDTO
    + isConfirmationDialogOpen: boolean
    + isProcessing: boolean
    + errorMessage: string
}

interface ReservationsApi <<interface>> {
    + getAvailableSlots(gameId: string, startDate: string, endDate: string): Promise<TimeSlotDTO[*]>
    + createReservation(slotId: string, gameId: string, participantCount: number): Promise<ReservationSummaryDTO>
    + cancelReservation(reservationId: string): Promise<boolean>
    + markPaymentCompleted(reservationId: string): Promise<boolean>
}

class TimeSlotDTO <<DTO>> {
    + slotId: string
    + gameId: string
    + startTime: string
    + endTime: string
    + location: string
    + isAvailable: boolean
    + basePrice: number
}

class ReservationSummaryDTO <<DTO>> {
    + reservationId: string
    + slotId: string
    + gameId: string
    + organizerId: string
    + participantCount: number
    + totalCost: number
    + status: string
    + isPaid: boolean
}

useCalendar .u.|> ICalendarActions
useCalendar -u-> ICalendarWindows
useCalendar --> ReservationsApi : apiClient.reservations
useCalendar *-- "1" CalendarViewModel : state

CalendarViewModel *-- "0..1" TimeSlotDTO : selectedSlot
CalendarViewModel *-- "0..1" ReservationSummaryDTO : activeReservation
ReservationsApi ..> TimeSlotDTO
ReservationsApi ..> ReservationSummaryDTO

note right of ICalendarActions
    Na diagramie tylko metody PU2. Metody PU1
    (onOpenCalendar, onShowCalendar, obsluga sesji)
    sa zdefiniowane w interfaces.md i w diagramie PU1.
end note

note right of ICalendarWindows
    Okna kalendarza (showCalendarView, showSessionExpiredMessageDialog,
    showLoginView) naleza do PU1 - powrot do kalendarza
    po cofnieciu odbywa sie przez showCalendarView z diagramu PU1.
end note

note bottom of CalendarViewModel
    Pelna definicja stanu (pola PU1: availableSlots,
    isSessionExpired) znajduje sie w interfaces.md.
end note

note bottom of ReservationsApi
    cancelReservation jest rozszerzeniem specyfikacji
    interfaces.md - wymagane przez opcje cofniecia
    prosby o potwierdzenie (slot musi zostac zwolniony).
end note

note bottom of useCalendar
    Mapowanie scenariusza PU2 (glowny):
    1. wybor wolnego terminu w kalendarzu (PU1) -> onSelectTimeSlot / onReserveEventClick
    2. otwarcie widoku rezerwacji z terminem przekazanym z gory -> showReservationView
    3. podanie liczby uczestnikow -> onParticipantCountChange
    4. utworzenie rezerwacji (status unpaid) -> createReservation
    5. prosba o potwierdzenie (z opcja cofniecia) -> showReservationConfirmDialog
    6. potwierdzenie -> onProceedToPayment / cofniecie -> onCancelReservation
    7. wymaganie platnosci -> showPaymentView; oplata -> onPay (markPaymentCompleted)
    8. potwierdzenie rezerwacji wysyla backend do skrzynki wiadomosci organizatora
end note
@enduml
```

</div>

![](rendered/reservation-presenter.svg)
