<div hidden>

```
@startuml logic_structure_frontend
left to right direction
skinparam componentStyle uml2
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 6
skinparam linetype ortho
skinparam nodesep 18
skinparam ranksep 70
skinparam package {
    BackgroundColor #FAFAFA
    BorderColor #888888
}
skinparam component {
    BackgroundColor #EEF4FF
    BorderColor #4A6FA5
}
skinparam interface {
    BackgroundColor #FFFFFF
    BorderColor #4A6FA5
}

title Model struktury logicznej - frontend (komponenty i interfejsy)

package "View" as V {
    component [Layout] as V_Layout
    component [CalendarView] as V_Calendar
    component [CreatorPanelView] as V_Creator
    component [GameDefinitionView] as V_GameDef
    component [GameListView] as V_GameList
    component [ScenarioEditorView] as V_Scenario
    component [NewTaskView] as V_NewTask
    component [ActionDefinitionView] as V_Action
    component [ReservationView] as V_Reservation
}

package "Presenter" as P {
    () "ICalendarActions" as I_Calendar
    () "ICreatorPanelActions" as I_Creator
    () "IGameDefinitionActions" as I_GameDef
    () "IGameListActions" as I_GameList
    () "IScenarioEditorActions" as I_Scenario
    () "INewTaskActions" as I_NewTask
    () "IActionDefinitionActions" as I_Action
    () "IReservationActions" as I_Reservation

    component [useCalendar] as P_Calendar
    component [useCreatorPanel] as P_Creator
    component [useGameDefinition] as P_GameDef
    component [useGameList] as P_GameList
    component [useScenarioEditor] as P_Scenario
    component [useNewTask] as P_NewTask
    component [useActionDefinition] as P_Action
    component [useReservation] as P_Reservation

    I_Calendar -- P_Calendar
    I_Creator -- P_Creator
    I_GameDef -- P_GameDef
    I_GameList -- P_GameList
    I_Scenario -- P_Scenario
    I_NewTask -- P_NewTask
    I_Action -- P_Action
    I_Reservation -- P_Reservation
}

package "API proxy" as A {
    () "ICalendarApi" as IA_Calendar
    () "IGamesApi" as IA_Games
    () "IScenariosApi" as IA_Scenarios
    () "IActionsApi" as IA_Actions
    () "IReservationsApi" as IA_Reservations

    component [calendarApi] as A_Calendar
    component [gamesApi] as A_Games
    component [scenariosApi] as A_Scenarios
    component [actionsApi] as A_Actions
    component [reservationsApi] as A_Reservations
    component [httpClient] as A_Http

    IA_Calendar -- A_Calendar
    IA_Games -- A_Games
    IA_Scenarios -- A_Scenarios
    IA_Actions -- A_Actions
    IA_Reservations -- A_Reservations

    A_Calendar --> A_Http
    A_Games --> A_Http
    A_Scenarios --> A_Http
    A_Actions --> A_Http
    A_Reservations --> A_Http
}

() "Backend REST\n/api/v1" as REST
A_Http --( REST

V_Layout --( I_Calendar
V_Calendar --( I_Calendar
V_Creator --( I_Creator
V_GameDef --( I_GameDef
V_GameList --( I_GameList
V_Scenario --( I_Scenario
V_NewTask --( I_NewTask
V_Action --( I_Action
V_Reservation --( I_Reservation

P_Calendar --( IA_Calendar
P_GameDef --( IA_Games
P_GameList --( IA_Games
P_Scenario --( IA_Games
P_Scenario --( IA_Scenarios
P_NewTask --( IA_Scenarios
P_Action --( IA_Actions
P_Reservation --( IA_Reservations

note bottom of A
    apiClient (fasada) składa moduły: apiClient.calendar, .games, .scenarios, .actions, .reservations.
    httpClient - jedyna instancja axios, błędy jako ApiError.
end note

note bottom of V
    Każdy widok realizuje też IXxxWindows swojego PU
    i przy przejściach woła prezentery innych PU
    (szczegóły: diagramy widoków PU).
end note
@enduml
```

</div>

![](rendered/logic_structure_frontend.svg)
