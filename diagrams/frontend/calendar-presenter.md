@startuml
class useCalendar {
onShowCalendar()
onBack()
}

interface ICalendarActions <<interface>> {
onShowCalendar()
onBack()
}

useCalendar .|> ICalendarActions

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
