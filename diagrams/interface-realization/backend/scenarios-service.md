<div hidden>

```
@startuml scenarios-service-load-scenario
skinparam shadowing false
skinparam roundcorner 4
skinparam sequenceMessageAlign left
skinparam responseMessageBelowArrow true
skinparam maxMessageSize 260
skinparam ParticipantPadding 8
hide footbox
autonumber

title IScenariosService.load_scenario - realizacja interfejsu (PU56)

participant "ScenariosController" as C <<Controller>>
participant "IScenariosService" as I <<interface>>
participant ":ScenariosService" as S
participant "db_session: Session" as DB
participant "game: Game" as G
participant "scenario: Scenario" as SC

C -> I : load_scenario(game_id, user_id)
I -> S : load_scenario(game_id, user_id)
S -> DB : get(Game, game_id)
DB --> S : game | None
alt gra nie istnieje albo game.author_id != user_id
    S --> C : raise NotFoundError (404)
else
    S -> G : scenario
    G --> S : scenario | None
    opt gra nie ma scenariusza
        S -> SC ** : Scenario(game_id = game.id)
        S -> DB : add(scenario)
        S -> DB : commit()
        S -> DB : refresh(scenario)
    end
    S -> S : _map_to_response(scenario)
    loop każde zadanie z scenario.tasks (ORDER BY position)
        S -> S : _map_task(task): TaskSchema
    end
    S --> C : ScenarioDetailSchema(victory_conditions = [])
end
@enduml
```

</div>

![](rendered/scenarios-service-load-scenario.svg)
