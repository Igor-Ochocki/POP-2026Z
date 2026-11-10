<div hidden>

```
@startuml calendar
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU1 Wyświetlanie kalendarza - backend

interface ICalendarApi <<interface>>\n<< /api/v1/calendar >> {
    + <<GET /events?month >>\n\tget_events(month: date): list[CalendarEventSchema]
}

class CalendarController <<Controller>> {
    - calendar_service: ICalendarService
}

interface ICalendarService <<interface>> {
    + get_events(month: date): list[CalendarEventSchema]
}

class CalendarService <<Service>> {
    - db_session: Session
    - _month_range(month: date): tuple[datetime, datetime]
    - _to_event(slot: TimeSlot): CalendarEventSchema
}

class TimeSlot <<Base>>
class Game <<Base>>
class CalendarEventSchema <<BaseModel>>

CalendarController .u.|> ICalendarApi
CalendarController --> ICalendarService
CalendarService .u.|> ICalendarService
CalendarService --> TimeSlot
TimeSlot --> Game : tytuł wydarzenia
CalendarService ..> CalendarEventSchema

note right of ICalendarApi
    month - dowolny dzień wybranego miesiąca (YYYY-MM-DD),
    brak lub zły format -> 422.
    Zwraca wolne i zajęte terminy z miesiąca, posortowane po dacie:
    id = TimeSlot.id, title = Game.title, datetime = TimeSlot.start_time.
end note

note bottom of TimeSlot
    Schematy: interfaces.md, encje: data-model.md
end note
@enduml
```

</div>

![](rendered/calendar.svg)
