<div hidden>

```
@startuml interfaces
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam nodesep 26
skinparam ranksep 34
skinparam linetype polyline

title Specyfikacja interfejsów (backend)

package "Data Transfer Schemas (Pydantic Models)" {
    class GameCreateSchema <<BaseModel>> {
        + title: str
        + description: str
        + min_players: int
        + max_players: int
        + duration_minutes: int
        + requires_invitation: bool = false
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

    class ActionCreateSchema <<BaseModel>> {
        + game_id: str
        + name: str
        + action_type: str
        + outcome_type: str
        + outcome_value: str
    }

    class TaskCreateSchema <<BaseModel>> {
        + title: str
        + narrative: str
        + interaction_type: str
        + interaction_target_id: str
        + required_player_level: int = 1
        + time_limit_minutes: int | None = None
        + reward_type: str
        + reward_value: str
    }

    class ScenarioDetailSchema <<BaseModel>> {
        + scenario_id: str
        + game_id: str
        + tasks: list[TaskCreateSchema]
        + victory_conditions: list[str]
    }

    class TimeSlotSchema <<BaseModel>> {
        + slot_id: str
        + game_id: str
        + start_time: datetime
        + end_time: datetime
        + location: str
        + is_available: bool
        + base_price: float
    }

    class ReservationCreateSchema <<BaseModel>> {
        + slot_id: str
        + game_id: str
        + participant_count: int
    }

    class ReservationSummarySchema <<BaseModel>> {
        + reservation_id: str
        + slot_id: str
        + game_id: str
        + organizer_id: str
        + participant_count: int
        + total_cost: float
        + status: str
        + is_paid: bool
    }
}

package "Services (Application Business Logic)" {
    class GamesService {
        - db_session: Session
        + save_game(dto: GameCreateSchema, as_draft: bool): GameResponseSchema
        + submit_to_reviewer(game_id: str): bool
    }

    class ActionsService {
        - db_session: Session
        + get_action_types(): list[str]
        + create_action(dto: ActionCreateSchema): str
    }

    class ScenariosService {
        - db_session: Session
        + load_scenario(game_id: str): ScenarioDetailSchema
        + add_task(scenario_id: str, dto: TaskCreateSchema): bool
    }

    class CalendarService {
        - db_session: Session
        + query_available_slots(game_id: str, start_date: datetime, end_date: datetime): list[TimeSlotSchema]
        + create_reservation(user_id: str, dto: ReservationCreateSchema): ReservationSummarySchema
        + mark_payment_completed(reservation_id: str): bool
    }
}

GamesService ..> GameCreateSchema : consumes
GamesService ..> GameResponseSchema : produces
ActionsService ..> ActionCreateSchema : consumes
ScenariosService ..> ScenarioDetailSchema : produces
ScenariosService ..> TaskCreateSchema : consumes
CalendarService ..> TimeSlotSchema : produces
CalendarService ..> ReservationCreateSchema : consumes
CalendarService ..> ReservationSummarySchema : produces

@enduml
```

</div>

![](rendered/interfaces.svg)
