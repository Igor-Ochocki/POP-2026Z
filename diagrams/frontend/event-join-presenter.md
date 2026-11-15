<div hidden>

```
@startuml event-join-presenter
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU46 Dołączenie do wydarzenia - presenter

interface IEventJoinActions <<interface>> {
    + onOpenEventJoin(event: EventDTO)
    + onConfirmJoin()
    + onCancelJoin()
    + onEventJoinedMessageDialogConfirm()
    + onEventFullMessageDialogConfirm()
    + onEventUnavailableMessageDialogConfirm()
    + onAccountBlockedMessageDialogConfirm()
}

interface IEventJoinWindows <<interface>> {
    + showEventJoinConfirmDialog()
    + showEventJoinedMessageDialog()
    + showEventFullMessageDialog()
    + showEventUnavailableMessageDialog()
    + showAccountBlockedMessageDialog()
    + hideDialogs()
}

class useEventJoin <<Hook>> {
    - joinEvent()
}

class EventJoinViewModel <<State>> {
    + selectedEvent: EventDTO | null
    + dialogType: EventJoinDialogTypes | null
}

enum EventJoinDialogTypes {
    confirmation
    joined
    eventFull
    eventUnavailable
    accountBlocked
}

interface IEventsApi <<interface>>
interface IEventListActions <<interface>>
class EventDTO <<DTO>>

useEventJoin .u.|> IEventJoinActions
useEventJoin -u-> IEventJoinWindows
useEventJoin *-- "1" EventJoinViewModel : state
useEventJoin --> IEventListActions : onOpenEventList (PU45)
EventJoinViewModel ..> EventJoinDialogTypes
EventJoinViewModel ..> EventDTO : selectedEvent
useEventJoin --> IEventsApi : apiClient.events\njoinEvent


@enduml
```

</div>

![](rendered/event-join-presenter.svg)
