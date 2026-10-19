<div hidden>

```
@startuml logic_structure_model
skinparam componentStyle uml2
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam nodesep 28
skinparam ranksep 38
skinparam linetype polyline

title Model struktury logicznej - iteracja 1

package "View (React Components)" as V {
    component [GameDefinitionView] as V_GameDefinition
    component [CalendarView] as V_Calendar

    interface "IGameDefinitionActions" as IV_Definition
    interface "ICalendarActions" as IV_Calendar

    V_GameDefinition -down- IV_Definition
    V_Calendar -down- IV_Calendar
}

package "Presenter (App Logic - React Hooks)" as P {
    component [GameDefinitionPresenter\n(useGameDefinition Hook)] as P_Definition
    component [CalendarPresenter\n(useCalendar Hook)] as P_Calendar

    P_Definition -up-( IV_Definition : <<binds state & events>>
    P_Calendar -up-( IV_Calendar : <<binds state & events>>
}

package "Model (FastApi Services)" as M {
    component [GamesService\n(/api/v1/games)] as M_Games
    component [ActionsService\n(/api/v1/actions)] as M_Actions
    component [ScenariosService\n(/api/v1/scenarios)] as M_Scenarios
    component [CalendarService\n(/api/v1/reservations)] as M_Calendar
}

P_Definition -down-> M_Games : <<HTTP/REST>>\nPOST/PUT /api/v1/games
P_Definition -down-> M_Actions : <<HTTP/REST>>\nPOST/GET /api/v1/actions
P_Definition -down-> M_Scenarios : <<HTTP/REST>>\nPOST/GET /api/v1/scenarios
P_Calendar -down-> M_Calendar : <<HTTP/REST>>\nPOST/GET /api/v1/reservations

package "Data" as D {
    database [SQLite DBMS] as DB_Sqlite
}

M_Games -down-> DB_Sqlite : port: DB Access (SQL)
M_Actions -down-> DB_Sqlite : port: DB Access (SQL)
M_Scenarios -down-> DB_Sqlite : port: DB Access (SQL)
M_Calendar -down-> DB_Sqlite : port: DB Access (SQL)

V -[hidden]down-> P
P -[hidden]down-> M
M -[hidden]down-> D

V_GameDefinition -[hidden]right-> V_Calendar
P_Definition -[hidden]right-> P_Calendar
M_Games -[hidden]right-> M_Actions
M_Actions -[hidden]right-> M_Scenarios
M_Scenarios -[hidden]right-> M_Calendar

@enduml
```

</div>

![](rendered/logic_structure_model.svg)
