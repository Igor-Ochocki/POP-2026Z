<div hidden>

```
@startuml scenario-editor
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU56 Wyświetlenie scenariusza gry w edytorze - backend

interface IScenariosApi <<interface>>\n<< /api/v1/games >> {
    + <<GET /{game_id}/scenario >>\n\tload_scenario(game_id: str, user_id: str): ScenarioDetailSchema
}

class ScenariosController <<Controller>> {
    - scenarios_service: IScenariosService
}

interface IScenariosService <<interface>> {
    + load_scenario(game_id: str, user_id: str): ScenarioDetailSchema
}

class ScenariosService <<Service>> {
    - db_session: Session
    - _map_task(task: Task): TaskSchema
    - _map_to_response(scenario: Scenario): ScenarioDetailSchema
}

class Game <<Base>>
class Scenario <<Base>>
class Task <<Base>>
class ScenarioDetailSchema <<BaseModel>>
class NotFoundError <<Exception>>

ScenariosController .u.|> IScenariosApi
ScenariosController --> IScenariosService
ScenariosService .u.|> IScenariosService
ScenariosService --> Game
ScenariosService --> Scenario
ScenariosService --> Task
ScenariosService ..> ScenarioDetailSchema
ScenariosService ..> NotFoundError : gra nie istnieje\nalbo jest cudza

note right of ScenariosService
    Gra bez scenariusza dostaje pusty scenariusz
    przy pierwszym odczycie (get-or-create).
    victory_conditions - placeholder (pusta lista) do PU58.
    Zadania (PU57) trafią pod ten sam prefiks:
    POST /{game_id}/scenario/tasks - backend/new-task.md.
end note

note bottom of Task
    Schematy: interfaces.md, encje: data-model.md
end note
@enduml
```

</div>

![](rendered/scenario-editor.svg)
