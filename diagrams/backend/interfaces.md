<div hidden>

```
@startuml interfaces
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title Backend - schematy (DTO) API i wyjątki (wspólne dla wszystkich PU)

package "Gry (PU49, PU25)" as P_Games {
    class GameCreateSchema <<BaseModel>> {
        + title: str [1..200]
        + description: str [1..1000]
        + min_players: int [1..100]
        + max_players: int [1..100]
        + duration_minutes: int [1..10080]
        + requires_invitation: bool = False
        + tags: list[str]
    }

    class GameResponseSchema <<BaseModel>> {
        + game_id: str
        + title: str
        + description: str
        + min_players: int
        + max_players: int
        + duration_minutes: int
        + requires_invitation: bool
        + tags: list[str]
        + status: str
    }

    note bottom of GameCreateSchema
        Walidacja: min_players <= max_players.
        Kategoria gry trafia do tags[0].
    end note
}

package "Scenariusz i zadania (PU56, PU57)" as P_Scenario {
    class ScenarioDetailSchema <<BaseModel>> {
        + scenario_id: str
        + game_id: str
        + tasks: list[TaskSchema]
        + victory_conditions: list[str]
    }

    class TaskSchema <<BaseModel>> {
        + task_id: str
        + title: str
        + narrative: str
        + interaction_type: str
        + interaction_target_id: str | None
        + required_player_level: int
        + time_limit_minutes: int | None
        + reward_type: str
        + reward_value: str
    }

    class TaskCreateSchema <<BaseModel>> {
        + title: str [1..200]
        + narrative: str [1..2000]
        + interaction_type: str
        + interaction_target_id: str | None = None
        + required_player_level: int >= 1 = 1
        + time_limit_minutes: int > 0 | None = None
        + reward_type: str
        + reward_value: str
    }

    ScenarioDetailSchema *-- "*" TaskSchema

}

package "Akcje (PU51)" as P_Actions {
    class ActionCreateSchema <<BaseModel>> {
        + game_id: str [1..36]
        + name: str [1..100]
        + action_type: ActionType
        + outcome_type: EffectKind
        + outcome_value: str [1..200]
    }

    class ActionSchema <<BaseModel>> {
        + action_id: str
        + game_id: str
        + name: str
        + action_type: str
        + outcome_type: str
        + outcome_value: str
    }
}

package "Kalendarz (PU1)" as P_Calendar {
    class CalendarEventSchema <<BaseModel>> {
        + id: str
        + title: str
        + datetime: datetime
    }
}

package "Rezerwacje (PU2)" as P_Reservations {
    class ReservationCreateSchema <<BaseModel>> {
        + slot_id: str
        + participant_count: int > 0
    }

    class ReservationSummarySchema <<BaseModel>> {
        + reservation_id: str
        + slot_id: str
        + game_id: str
        + organizer_id: str
        + participant_count: int
        + total_cost: float
        + status: ReservationStatus
        + is_paid: bool
    }
}

package "Wyjątki (core/exceptions)" as P_Errors {
    class AppError <<Exception>> {
        + status_code = 400
    }
    class ForbiddenError <<Exception>> {
        + status_code = 403
    }
    class NotFoundError <<Exception>> {
        + status_code = 404
    }
    class ConflictError <<Exception>> {
        + status_code = 409
    }

    ForbiddenError -u-|> AppError
    NotFoundError -u-|> AppError
    ConflictError -u-|> AppError

    note bottom of AppError
        Jeden handler (register_exception_handlers)
        zamienia AppError na odpowiedź {detail} ze status_code.
        Błędy walidacji schematów zwraca FastAPI jako 422.
    end note
}

P_Games -[hidden]r- P_Scenario
P_Scenario -[hidden]r- P_Actions
P_Games -[hidden]d- P_Calendar
P_Calendar -[hidden]r- P_Reservations
P_Reservations -[hidden]r- P_Errors

note as N_Enums
    Enumy (ActionType, EffectKind, ReservationStatus, GameStatus)
    i encje bazy danych: data-model.md.
    Schematy są w snake_case - frontend mapuje je na DTO w camelCase.
end note
@enduml
```

</div>

![](rendered/interfaces.svg)
