@startuml
class useCalendar {
onShowCalendar()
onChangeMonth(month :Date)
onBack()
}

class CalendarViewModel <<State>> {
events :CalendarEventDTO[]
month :Date | null
errorMessage :string | null
}

interface ICalendarActions <<interface>> {
onShowCalendar()
onChangeMonth(month :Date)
onBack()
}

useCalendar .|> ICalendarActions
useCalendar *-- CalendarViewModel

useCalendar --> ICalendarApi
useCalendar -u-> ICalendarWindows

interface ICalendarApi <<interface>> {
getEvents(month :Date) :Promise<CalendarEventDTO[]>
}

interface ICalendarWindows <<interface>> {
showCalendarView()
}
@enduml

![](rendered/calendar-presenter.svg)
