<div hidden>

```
@startuml scenario-editor-view
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline

title PU56 Wyświetlenie scenariusza gry w edytorze - widok

class GameDefinitionView {
    + onEditScenarioClick()
}

class ScenarioEditorView {
    + show(game: GameMetadataDTO, scenario: ScenarioDetailDTO)
    + onRetryClick()
    + onAddTaskClick()
    + onCloseClick()
}

class NewTaskView

interface IScenarioEditorActions <<interface>> {
    + onOpenScenarioEditor(gameId: string)
    + onReloadScenario()
}

interface INewTaskActions <<interface>> {
    + onNewTaskSelect()
}

interface IGameDefinitionActions <<interface>> {
    + onOpenGame(gameId: string)
}

interface IScenarioEditorWindows <<interface>> {
    + showScenarioEditorView(gameId: string)
}

class ScenarioEditorWindows

GameDefinitionView --> IScenarioEditorActions : onOpenScenarioEditor
ScenarioEditorView --> IScenarioEditorActions : onReloadScenario
ScenarioEditorView --> INewTaskActions : "Dodaj zadanie" (PU57)
ScenarioEditorView --> IGameDefinitionActions : "Zamknij" (PU49)

ScenarioEditorWindows .u.|> IScenarioEditorWindows
ScenarioEditorWindows --> ScenarioEditorView

ScenarioEditorView ..> NewTaskView
ScenarioEditorView ..> GameDefinitionView

note right of ScenarioEditorView
    Lista zadań, lista warunków zwycięstwa i metadane
    gry to części tego widoku. "Dodaj warunek" jest
    nieaktywne do czasu PU58.
end note
@enduml
```

</div>

![](rendered/scenario-editor-view.svg)
