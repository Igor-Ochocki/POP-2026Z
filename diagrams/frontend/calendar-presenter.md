@startuml
class useCalendar {
onShowCalendar()
onSessionExpiredMessageDialogConfirm()
}

interface ICalendarActions <<interface>> {
onShowCalendar()
onSessionExpiredMessageDialogConfirm()
}

useCalendar .|> ICalendarActions

useCalendar --> ICalendarApi
useCalendar -u-> ICalendarWindows

interface ICalendarApi <<interface>> {
getEvents(month :Date) :CalendarEventDTO[]
}

interface ICalendarWindows <<interface>> {
showCalendarView(events :CalendarEventDTO[])
showSessionExpiredMessageDialog()
showLoginView()
}
@enduml

![](rendered/calendar-presenter.svg)
