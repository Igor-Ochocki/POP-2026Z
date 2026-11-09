<div hidden>

```
@startuml scenario-editor-presenter
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline

title PU56 Wyświetlenie scenariusza gry w edytorze - presenter

class useScenarioEditor <<Hook>> {
    + onOpenScenarioEditor(gameId: string)
    + onReloadScenario()
}

interface IScenarioEditorActions <<interface>> {
    + onOpenScenarioEditor(gameId: string)
    + onReloadScenario()
}

interface IScenarioEditorWindows <<interface>> {
    + showScenarioEditorView(gameId: string)
}

interface IScenarioApi <<interface>> {
    + loadScenario(gameId: string, userId: string): Promise<ScenarioDetailDTO>
}

interface IGamesApi <<interface>> {
    + getGame(gameId: string, userId: string): Promise<GameResponseDTO>
}

class ScenarioEditorViewModel <<State>> {
    + gameId: string | null
    + activeGame: GameMetadataDTO | null
    + scenario: ScenarioDetailDTO | null
    + isLoading: boolean
    + errorMessage: string | null
}

class ScenarioDetailDTO <<DTO>> {
    + scenarioId: string
    + gameId: string
    + tasks: TaskDTO[*]
    + victoryConditions: string[*]
}

useScenarioEditor .u.|> IScenarioEditorActions
useScenarioEditor -u-> IScenarioEditorWindows
useScenarioEditor --> IScenarioApi : apiClient.scenario
useScenarioEditor --> IGamesApi : apiClient.games
useScenarioEditor *-- "1" ScenarioEditorViewModel : state
ScenarioEditorViewModel ..> ScenarioDetailDTO
IScenarioApi ..> ScenarioDetailDTO

note bottom of useScenarioEditor
    onOpenScenarioEditor(gameId) przechodzi do edytora (showScenarioEditorView).
    Gra i scenariusz są wczytywane tylko na trasie edytora,
    więc widoki innych PU wołające onOpenScenarioEditor nie wywołują API.
    onReloadScenario ponawia wczytanie po błędzie.
end note

note right of ScenarioEditorViewModel
    activeGame pobierane przez GET /games/{id} (IGamesApi.getGame),
    scenariusz przez GET /games/{id}/scenario. userId z ENV (VITE_DEV_USER_ID).
    TaskDTO: types/task.ts.
end note
@enduml
```

</div>

![](rendered/scenario-editor-presenter.svg)
