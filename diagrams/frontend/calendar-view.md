@startuml
class CalendarView {
show()
onMonthChange(month :Date)
}

class MessageDialog {
show()
onClick()
}

class SessionExpiredMessageDialog
SessionExpiredMessageDialog -u-|> MessageDialog

class LoginView {
show()
}

interface ICalendarActions <<interface>> {
onShowCalendar()
onMonthChange(month :Date)
onSessionExpiredMessageDialogConfirm()
}

ICalendarActions <-u- CalendarView
ICalendarActions <-u- SessionExpiredMessageDialog

CalendarView --> CalendarEventDTO

class CalendarEventDTO <<DTO>> {
id :string
title :string
datetime :Date
}

interface ICalendarWindows <<interface>> {
showCalendarView()
showSessionExpiredMessageDialog()
showLoginView()
}

class CalendarWindows {
showCalendarView()
showSessionExpiredMessageDialog()
showLoginView()
}

CalendarWindows .d.|> ICalendarWindows
CalendarWindows --u-> CalendarView
CalendarWindows --u-> SessionExpiredMessageDialog
CalendarWindows --u-> LoginView
@enduml

![](rendered/calendar-view.svg)
