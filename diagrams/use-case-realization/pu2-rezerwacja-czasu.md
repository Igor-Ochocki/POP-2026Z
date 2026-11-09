<div hidden>

```
@startuml pu2-rezerwacja-czasu
skinparam shadowing false
skinparam roundcorner 4
skinparam sequenceMessageAlign left
skinparam responseMessageBelowArrow true
skinparam maxMessageSize 260
skinparam ParticipantPadding 8
hide footbox
autonumber

title PU2 Rezerwacja czasu dla gry - realizacja przypadku użycia (komponenty i interfejsy)

actor "Organizator zewnętrzny" as U
box "Frontend (planowany - projekt z PR #72)" #F4F8FF
    participant "CalendarView" as VC <<View>>
    participant "ReservationView" as V <<View>>
    participant "IReservationActions" as IA <<interface>>
    participant "useReservation" as P <<Hook>>
    participant "IReservationWindows" as IW <<interface>>
    participant "IPaymentActions" as IPAY <<interface>>
    participant "IReservationsApi" as IAPI <<interface>>
    participant "reservationsApi" as API <<API>>
end box
box "Backend" #FFF8EE
    participant "IReservationsApi\n/api/v1/reservations" as REST <<interface>>
    participant "ReservationsController" as C <<Controller>>
    participant "IReservationsService" as IS <<interface>>
    participant "ReservationsService" as S <<Service>>
    participant "IPaymentService\nIMessageService" as IPM <<interface>>
end box
database "SQLite" as DB

== Wybór terminu w kalendarzu (PU1) ==
U -> VC : wybór wolnego terminu
VC -> IA : onOpenReservation(slot)
IA -> P : onOpenReservation(slot)
P -> IW : showReservationView()
IW --> U : formularz rezerwacji

U -> V : liczba uczestników
V -> IA : onChangeParameter(participantCount, value)
IA -> P : onChangeParameter(participantCount, value)
U -> V : "Zarezerwuj"
V -> IA : onSubmitReservation()
IA -> P : onSubmitReservation()
P -> IW : showReservationConfirmDialog()
IW --> U : potwierdzenie rezerwacji

== Utworzenie rezerwacji ==
U -> V : "Potwierdź"
V -> IA : onConfirmReservation()
IA -> P : onConfirmReservation()
P -> IAPI : createReservation(userId, dto)
IAPI -> API : createReservation(userId, dto)
API -> REST : POST /reservations?user_id
REST -> C : create_reservation(user_id, dto)
C -> IS : create_reservation(user_id, dto)
IS -> S : create_reservation(user_id, dto)
S -> DB : SELECT time_slots, games
S -> DB : UPDATE time_slots SET is_available = false\nWHERE id AND is_available
alt termin wolny
    S -> DB : INSERT reservations (status = unpaid)
    S --> C : ReservationSummarySchema
    C --> API : 201 ReservationSummarySchema
    API --> P : ReservationSummaryDTO
    P --> V : stan: activeReservation
    V --> U : podsumowanie i koszt rezerwacji
else termin zajęty (409) albo liczba uczestników poza zakresem gry (400)
    C --> API : 409 / 400
    API --> P : ApiError
    P -> IW : showSlotUnavailableMessageDialog()
    IW --> U : komunikat o niedostępnym terminie
end

== Płatność ==
alt zapłać później
    U -> V : "Zapłać później"
    V -> IA : onPayLater()
    IA -> P : onPayLater()
else zapłać teraz
    U -> V : "Zapłać teraz"
    V -> IPAY : onStartPayment(reservationId)
    ref over IPAY, DB : PU61 Płatność - w iteracji 1 mock:\nPOST /reservations/{id}/payment -> mark_payment_completed\n-> IPaymentService.process_payment, IMessageService.send_reservation_confirmation
else cofnięcie rezerwacji
    U -> V : "Anuluj"
    V -> IA : onCancelReservation()
    IA -> P : onCancelReservation()
    P -> IAPI : cancelReservation(reservationId, userId)
    IAPI -> API : cancelReservation(reservationId, userId)
    API -> REST : DELETE /reservations/{id}?user_id
    REST -> C : cancel_reservation(user_id, reservation_id)
    C -> IS : cancel_reservation(user_id, reservation_id)
    IS -> S : cancel_reservation(user_id, reservation_id)
    S -> DB : UPDATE reservations SET status = cancelled,\ntime_slots SET is_available = true
    S --> API : 200 true
    API --> P : true
    P -> IW : showReservationCancelledMessageDialog()
    IW --> U : komunikat o anulowaniu rezerwacji
end

note over VC, API
    Frontend PU2 nie jest jeszcze zaimplementowany - lifeline'y frontendu
    pochodzą z projektu (diagramy reservation-*). Backend jest gotowy.
end note
@enduml
```

</div>

![](rendered/pu2-rezerwacja-czasu.svg)
