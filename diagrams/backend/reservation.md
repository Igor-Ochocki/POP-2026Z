<div hidden>

```
@startuml reservation
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU2 Rezerwacja czasu dla gry - backend

interface IReservationsApi <<interface>>\n<< /api/v1/reservations >> {
    + <<POST / >>\n\tcreate_reservation(user_id: str, dto: ReservationCreateSchema): ReservationSummarySchema
    + <<DELETE /{reservation_id} >>\n\tcancel_reservation(user_id: str, reservation_id: str): bool
    + <<POST /{reservation_id}/payment >>\n\tmark_payment_completed(user_id: str, reservation_id: str): ReservationSummarySchema
}

class ReservationsController <<Controller>> {
    - reservations_service: IReservationsService
}

interface IReservationsService <<interface>> {
    + create_reservation(user_id: str, dto: ReservationCreateSchema): ReservationSummarySchema
    + cancel_reservation(user_id: str, reservation_id: str): bool
    + mark_payment_completed(user_id: str, reservation_id: str): ReservationSummarySchema
}

class ReservationsService <<Service>> {
    - db_session: Session
    - payment_service: IPaymentService
    - message_service: IMessageService
    - _lock_slot(slot_id: str)
    - _get_own_reservation(user_id: str, reservation_id: str): Reservation
    - _to_summary(reservation: Reservation): ReservationSummarySchema
}

interface IPaymentService <<interface>> {
    + process_payment(reservation_id: str, amount: float): bool
}

class PaymentService <<Service>> {
    - db_session: Session
}

interface IMessageService <<interface>> {
    + send_reservation_confirmation(organizer_id: str, reservation_id: str): bool
}

class MessageService <<Service>> {
    - db_session: Session
}

class TimeSlot <<Base>>
class Reservation <<Base>>
class Payment <<Base>>
class Message <<Base>>
class ReservationCreateSchema <<BaseModel>>
class ReservationSummarySchema <<BaseModel>>

ReservationsController .u.|> IReservationsApi
ReservationsController --> IReservationsService
ReservationsService .u.|> IReservationsService
ReservationsService --> IPaymentService
ReservationsService --> IMessageService
PaymentService .u.|> IPaymentService
MessageService .u.|> IMessageService
ReservationsService --> TimeSlot
ReservationsService --> Reservation
PaymentService --> Payment
MessageService --> Message
ReservationsService ..> ReservationCreateSchema
ReservationsService ..> ReservationSummarySchema

note right of IReservationsApi
    user_id - parametr query do czasu logowania.
    201 przy utworzeniu. Błędy (AppError):
    404 - brak terminu / rezerwacji,
    403 - rezerwacja innego organizatora,
    409 - termin zajęty, rezerwacja opłacona / anulowana,
    400 - liczba uczestników poza min-max gry.
end note

note bottom of ReservationsService
    create_reservation: termin zajmowany atomowo
    (UPDATE ... WHERE is_available), druga równoczesna
    rezerwacja -> 409. total_cost = base_price * participant_count.
    cancel_reservation: tylko nieopłacona, zwalnia termin.
    mark_payment_completed: mock bramki płatności (PU61),
    potwierdzenie trafia do skrzynki organizatora.
end note

note bottom of Message
    Schematy: interfaces.md, encje: data-model.md
end note
@enduml
```

</div>

![](rendered/reservation.svg)
