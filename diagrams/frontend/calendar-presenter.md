@startuml
class useCalendar {
onShowCalendar()
onBack()
}

class CalendarViewModel <<State>> {
events :CalendarEvent[]
}

interface ICalendarActions <<interface>> {
onShowCalendar()
onBack()
}

useCalendar .|> ICalendarActions
useCalendar *-- CalendarViewModel

useCalendar --> ICalendarApi
useCalendar -u-> ICalendarWindows

interface ICalendarApi <<interface>> {
getEvents(month :Date) :CalendarEventDTO[]
}

interface ICalendarWindows <<interface>> {
showCalendarView(events :CalendarEventDTO[])
}
@enduml

![](rendered/calendar-presenter.svg)
