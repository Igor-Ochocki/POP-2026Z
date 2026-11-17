<div hidden>


```
@startuml join-event
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
hide empty members

title PU46 Dołączenie do wydarzenia

interface IEventsApi <<interface>>\n<< /api/v1/events >> {
    + <<GET /{reserv_id} >>\n\tget_event(reserv_id: str): EventSchema
    + <<PUT /{reserv_id} >>\n \tjoin_event(reserv_id: str, user_id: str): EventSchema
}

class EventsController <<Controller>> {
    - events_service: IEventsService
}

interface IEventsService <<interface>> {
    + get_event(reserv_id: str): EventSchema
    + join_event(reserv_id: str, user_id: str): EventSchema
}

class EventsService <<Service>> {
    - db_session: Session
}

package "Enums" {
  enum EventStatus{
    open
    finished
    cancelled
    restricted
  }
}

class Event <<Base>>{
  + reserv_id: str
  + users_registered: int
  + participants: list[str]
  + event_status: EventStatus
}
class Reservation <<Base>>{
  + reserv_id: str
  + slot_id: str
  + game_id: str
  + participant_count: int
  + is_paid: bool
  + reserv_status: ReservationStatus
}

class EventSchema <<BaseModel>> {
  + reserv_id: str
  + users_registered: int
  + participants: list[str]
  + slot_id: str
  + game_id: str
  + participant_count: int
  + event_status: str
}

class NotFoundError <<Exception>>{

}


Event --> EventStatus
Event .u.|> Reservation

EventsController .u.|> IEventsApi
EventsController --> IEventsService
EventsService .u.|> IEventsService
EventsService --> Event
EventsService --> Reservation 
EventsService ..> EventSchema
EventsService ..> NotFoundError

note left of EventSchema
  Schemat przekazuje dane, więc 
  znajdują się w nim wszystkie atrybuty
  z obu modeli, potrzebne do wyświetlenia 
  wydarzenia w widoku
end note

note right of Event
  1. Event będzie uzależniony 
  od reservation 1:1,
  więc nie potrzebuje własnego id -
  będzie się posługiwał reservation_id
  2. participants będzie przechowywać listę 
  user_id użytkowników zapisanych 
  już na wydarzenie
  3. stworzenie Event uzaleznione
  od statusu Reservation = confirmed
  4. participant_count w Reservation będzie
  traktowane jako maksymalna ilość graczy
  na danym wydarzeniu, potrzebna
  do obliczenia kwoty rezerwacji,
  natomiast ilość zapisanych do tej pory
  uczestników wydarzenia będzie
  przechowywana w atrybucie users_registered
end note



@enduml
```


</div>

![](rendered/join-event.svg)