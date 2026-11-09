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
class GameListView

interface IScenarioEditorActions <<interface>> {
    + onOpenScenarioEditor(gameId: string)
    + onReloadScenario()
}

interface INewTaskActions <<interface>> {
    + onNewTaskSelect()
}

interface IGameListActions <<interface>> {
    + onOpenGameList()
}

interface IScenarioEditorWindows <<interface>> {
    + showScenarioEditorView(gameId: string)
}

class ScenarioEditorWindows

GameDefinitionView --> IScenarioEditorActions : onOpenScenarioEditor
ScenarioEditorView --> IScenarioEditorActions : onReloadScenario
ScenarioEditorView --> INewTaskActions : "Dodaj zadanie" (PU57)
ScenarioEditorView --> IGameListActions : "Zamknij" (PU25)

ScenarioEditorWindows .u.|> IScenarioEditorWindows
ScenarioEditorWindows --> ScenarioEditorView

ScenarioEditorView ..> NewTaskView
ScenarioEditorView ..> GameListView

note right of ScenarioEditorView
    Lista zadań, lista warunków zwycięstwa i metadane
    gry to części tego widoku. "Dodaj warunek" jest
    nieaktywne do czasu PU58.
end note

note bottom of GameListView
    Powrót do definicji tej samej gry wymaga wczytania
    gry po id w PU49 - do tego czasu edytor wraca do listy gier.
end note
@enduml
```

</div>

![](rendered/scenario-editor-view.svg)
