<div hidden>

```
@startuml logic_structure_model
skinparam componentStyle uml2
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype ortho
skinparam nodesep 40
skinparam ranksep 60

title Model struktury logicznej - diagram komponentów
left to right direction
skinparam linetype polyline

package "Frontend (React + TypeScript, SPA)" as FE {

    package "View (komponenty React)" as V {
        component [Layout] as V_Layout
        component [CreatorPanelView] as V_Creator
        component [GameDefinitionView] as V_GameDef
        component [GameListView] as V_GameList
        component [ScenarioEditorView] as V_Scenario
        component [NewTaskView] as V_NewTask
        component [ActionDefinitionView] as V_Action
        component [CalendarView] as V_Calendar
    }

    package "Presenter (hooki React)" as P {
        component [useCreatorPanel] as P_Creator
        component [useGameDefinition] as P_GameDef
        component [useGameList] as P_GameList
        component [useScenarioEditor] as P_Scenario
        component [useNewTask] as P_NewTask
        component [useActionDefinition] as P_Action
        component [useCalendar] as P_Calendar

        () "ICreatorPanelActions" as I_Creator
        () "IGameDefinitionActions" as I_GameDef
        () "IGameListActions" as I_GameList
        () "IScenarioEditorActions" as I_Scenario
        () "INewTaskActions" as I_NewTask
        () "IActionDefinitionActions" as I_Action
        () "ICalendarActions" as I_Calendar

        P_Creator - I_Creator
        P_GameDef - I_GameDef
        P_GameList - I_GameList
        P_Scenario - I_Scenario
        P_NewTask - I_NewTask
        P_Action - I_Action
        P_Calendar - I_Calendar
    }

    package "API proxy (Axios)" as A {
        component [apiClient] as A_Client
        component [gamesApi] as A_Games
        component [scenariosApi] as A_Scenario
        component [actionsApi] as A_Actions
        component [calendarApi] as A_Calendar
        component [httpClient] as A_Http

        () "IGamesApi" as IA_Games
        () "IScenariosApi" as IA_Scenario
        () "IActionsApi" as IA_Actions
        () "ICalendarApi" as IA_Calendar

        A_Games - IA_Games
        A_Scenario - IA_Scenario
        A_Actions - IA_Actions
        A_Calendar - IA_Calendar

        A_Client *-- A_Games
        A_Client *-- A_Scenario
        A_Client *-- A_Actions
        A_Client *-- A_Calendar
        A_Games --> A_Http
        A_Scenario --> A_Http
        A_Actions --> A_Http
        A_Calendar --> A_Http
    }
}

package "Backend (FastAPI)" as BE {
    package "Controllers (/api/v1)" as C {
        component [GamesController] as C_Games
        component [ScenariosController] as C_Scenarios
        component [ActionsController] as C_Actions
        component [CalendarController] as C_Calendar
        component [ReservationsController] as C_Reservations

        () "IGamesApi\n/games" as R_Games
        () "IScenariosApi\n/games/{id}/scenario" as R_Scenarios
        () "IActionsApi\n/actions" as R_Actions
        () "ICalendarApi\n/calendar" as R_Calendar
        () "IReservationsApi\n/reservations" as R_Reservations

        C_Games - R_Games
        C_Scenarios - R_Scenarios
        C_Actions - R_Actions
        C_Calendar - R_Calendar
        C_Reservations - R_Reservations
    }

    package "Services (logika aplikacji)" as S {
        component [GamesService] as S_Games
        component [ScenariosService] as S_Scenarios
        component [ActionsService] as S_Actions
        component [CalendarService] as S_Calendar
        component [ReservationsService] as S_Reservations
        component [PaymentService] as S_Payment
        component [MessageService] as S_Message

        () "IGamesService" as IS_Games
        () "IScenariosService" as IS_Scenarios
        () "IActionsService" as IS_Actions
        () "ICalendarService" as IS_Calendar
        () "IReservationsService" as IS_Reservations
        () "IPaymentService" as IS_Payment
        () "IMessageService" as IS_Message

        S_Games - IS_Games
        S_Scenarios - IS_Scenarios
        S_Actions - IS_Actions
        S_Calendar - IS_Calendar
        S_Reservations - IS_Reservations
        S_Payment - IS_Payment
        S_Message - IS_Message
    }

    component [Models (SQLAlchemy ORM)] as M_Orm
}

database "SQLite" as DB

' View -> Presenter (własny PU; przejścia między PU - diagramy widoków)
V_Creator --( I_Creator
V_GameDef --( I_GameDef
V_GameList --( I_GameList
V_Scenario --( I_Scenario
V_NewTask --( I_NewTask
V_Action --( I_Action
V_Calendar --( I_Calendar
V_Layout --( I_Calendar

' Presenter -> API proxy
P_GameDef --( IA_Games
P_GameList --( IA_Games
P_Scenario --( IA_Games
P_Scenario --( IA_Scenario
P_NewTask --( IA_Scenario
P_Action --( IA_Actions
P_Calendar --( IA_Calendar

' API proxy -> Backend (HTTP/REST, JSON)
A_Http --( R_Games
A_Http --( R_Scenarios
A_Http --( R_Actions
A_Http --( R_Calendar

' Controller -> Service
C_Games --( IS_Games
C_Scenarios --( IS_Scenarios
C_Actions --( IS_Actions
C_Calendar --( IS_Calendar
C_Reservations --( IS_Reservations
S_Reservations --( IS_Payment
S_Reservations --( IS_Message

S_Games --> M_Orm
S_Scenarios --> M_Orm
S_Actions --> M_Orm
S_Calendar --> M_Orm
S_Reservations --> M_Orm
S_Payment --> M_Orm
S_Message --> M_Orm
M_Orm --> DB : SQLAlchemy Session

note as N_Arch
    Widoki wołają też prezentery innych PU przy przejściach
    między przypadkami użycia (szczegóły: diagramy widoków).
    httpClient -> kontrolery: HTTP/REST, JSON (/api/v1).
    IReservationsApi (PU2) nie ma jeszcze konsumenta po stronie frontendu.
    Backend PU25 (GET /games, /games/tags) i PU57 (POST /games/{id}/scenario/tasks)
    są w przygotowaniu - frontend już z nich korzysta.
end note
@enduml
```

</div>

![](rendered/logic_structure_model.svg)
