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

title Backend - porty API, schematy (DTO) i wyjątki (wspólne dla wszystkich PU)

package "Porty API (kontrolery, prefiks /api/v1)" as P_Ports {
    interface IGamesApi <<interface>>\n<< /games >> {
        + <<GET /{game_id}>> get_game(game_id: str, user_id: str): GameResponseSchema
        + <<POST />> save_game(user_id: str, metadata: GameCreateSchema, as_draft: bool = True): GameResponseSchema
        + <<PUT /{game_id}>> edit_game(game_id: str, user_id: str, metadata: GameCreateSchema, as_draft: bool = True): GameResponseSchema
        + <<POST /{game_id}/submit>> submit_to_reviewer(game_id: str, user_id: str): bool
        + <<GET />> get_games(user_id: str, tags: list[str], limit: int, offset: int): list[GameResponseSchema]
        + <<GET /tags>> get_game_tags(): list[str]
    }

    interface IScenariosApi <<interface>>\n<< /games >> {
        + <<GET /{game_id}/scenario>> load_scenario(game_id: str, user_id: str): ScenarioDetailSchema
        + <<POST /{game_id}/scenario/tasks>> add_task(game_id: str, user_id: str, dto: TaskCreateSchema): TaskSchema
        + <<GET /{game_id}/scenario/victory_conditions>> get_victory_condition_list(game_id: str, user_id: str): list[VictoryConditionSchema]
        + <<GET /{game_id}/scenario/victory_conditions/{victory_condition_id}>> get_victory_condition(game_id: str, victory_condition_id: str, user_id: str): VictoryConditionSchema
        + <<POST /{game_id}/scenario/victory_conditions>> create_victory_condition(game_id: str, user_id: str, dto: VictoryConditionCreateSchema): VictoryConditionSchema
        + <<PUT /{game_id}/scenario/victory_conditions/{victory_condition_id}>> edit_victory_condition(game_id: str, victory_condition_id: str, user_id: str, dto: VictoryConditionCreateSchema): VictoryConditionSchema
    }

    interface IActionsApi <<interface>>\n<< /actions >> {
        + <<POST />> create_action(metadata: ActionCreateSchema): ActionSchema
        + <<GET /{action_id}>> get_action(action_id: str): ActionSchema
        + <<GET /action_types>> get_action_types(): list[str]
        + <<GET /effect_kind>> get_effect_kind(): list[str]
        + <<GET /list/{game_id}>> get_actions_list(game_id: str): list[ActionSchema]
    }

    interface IMapsApi <<interface>>\n<< /games >> {
        + <<GET /{game_id}/map>> get_map(game_id: str, user_id: str): MapSchema
        + <<POST /{game_id}/map/edit>> edit_map(game_id: str, user_id: str, data: MapSchema): MapSchema
        + <<GET /{game_id}/map/rooms/{room_id}>> get_room(game_id: str, room_id: int, user_id: str): RoomSchema
        + <<GET /{game_id}/inventory_items>> get_inventory_items(game_id: str, user_id: str): list[InventoryItemSchema]
        + <<PUT /{game_id}/map/rooms/{room_id}>> update_room(game_id: str, room_id: int, user_id: str, dto: RoomSchema): RoomSchema
        + <<GET /{game_id}/map/player>> get_player_map(game_id: str, user_id: str): PlayerMapSchema
    }

    interface ISensorsApi <<interface>>\n<< /games >> {
        + <<GET /sensor_types>> get_sensor_types(): list[str]
        + <<PUT /{game_id}/sensor/add>> add_sensor(game_id: str, user_id: str, room_id: str, data: SensorSchema): SensorSchema
    }

    interface ICalendarApi <<interface>>\n<< /calendar >> {
        + <<GET /events?month>> get_events(month: date): list[CalendarEventSchema]
    }

    interface IReservationsApi <<interface>>\n<< /reservations >> {
        + <<POST />> create_reservation(user_id: str, dto: ReservationCreateSchema): ReservationSummarySchema
        + <<DELETE /{reservation_id}>> cancel_reservation(user_id: str, reservation_id: str): bool
        + <<POST /{reservation_id}/payment>> mark_payment_completed(user_id: str, reservation_id: str): ReservationSummarySchema
    }

    interface IEventsApi <<interface>>\n<< /events >> {
        + <<GET /{reserv_id}>> get_event(reserv_id: str): EventSchema
        + <<PUT /{reserv_id}>> join_event(reserv_id: str, user_id: str): EventSchema
    }

    IGamesApi -[hidden]d- IScenariosApi
    IScenariosApi -[hidden]d- IActionsApi
    IActionsApi -[hidden]d- IMapsApi
    IMapsApi -[hidden]d- ISensorsApi
    ISensorsApi -[hidden]d- ICalendarApi
    ICalendarApi -[hidden]d- IReservationsApi
    IReservationsApi -[hidden]d- IEventsApi

    note right of IEventsApi
        Każdy port realizuje kontroler XxxController, który woła IXxxService
        o tych samych metodach (diagramy backendu PU).
        Schematy map, komnat, czujników, warunków zwycięstwa i wydarzeń
        są na razie na diagramach PU58, PU60, PU59, PU50, PU35, PU46.
    end note
}

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

P_Ports -[hidden]r- P_Games
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
