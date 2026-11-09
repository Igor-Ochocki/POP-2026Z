@startuml
class CalendarView {
show()
}

interface ICalendarActions <<interface>> {
onShowCalendar()
onChangeMonth(month :Date)
onBack()
}

ICalendarActions <-u- CalendarView

class Layout {
onCalendarMenuClick()
}

ICalendarActions <-u- Layout : "Kalendarz" (onShowCalendar)

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
