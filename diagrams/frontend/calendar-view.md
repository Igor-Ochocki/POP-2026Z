@startuml
class CalendarView {
show()
}

interface ICalendarActions <<interface>> {
onShowCalendar()
onBack()
}

ICalendarActions <-u- CalendarView

CalendarView --> CalendarEventDTO

class CalendarEventDTO <<DTO>> {
id :string
title :string
datetime :Date
}

interface ICalendarWindows <<interface>> {
showCalendarView()
}

class CalendarWindows {
showCalendarView()
}

CalendarWindows .d.|> ICalendarWindows
CalendarWindows --u-> CalendarView
@enduml

![](rendered/calendar-view.svg)
