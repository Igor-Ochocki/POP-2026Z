<div hidden>

```
@startuml game-definition-view
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU49 Zdefiniowanie gry - widok

class CreatorPanelView <<View>> {
    + onCreateGameClick()
    + onGameListClick()
}

class GameDefinitionView <<View>> {
    + onEditParametersClick()
    + onEditScenarioClick()
    + onDefineActionClick()
    + onSaveClick()
    + onSaveAndSubmitClick()
    + onCancelClick()
}

class GameParametersPanel <<View>> {
    + onFieldChange(field: string, value: string | boolean)
    + onSaveClick()
}

class MessageDialog {
    + show(title: string, message: string)
    + onOkClick()
}

class ParametersSavedMessageDialog
class IncorrectDataMessageDialog
class GameSavedMessageDialog
class GameSubmittedMessageDialog
class SaveErrorMessageDialog
class LoadErrorMessageDialog

ParametersSavedMessageDialog -u-|> MessageDialog
IncorrectDataMessageDialog -u-|> MessageDialog
GameSavedMessageDialog -u-|> MessageDialog
GameSubmittedMessageDialog -u-|> MessageDialog
SaveErrorMessageDialog -u-|> MessageDialog
LoadErrorMessageDialog -u-|> MessageDialog

class GameDefinitionWindows
interface IGameDefinitionWindows <<interface>>
interface IGameDefinitionActions <<interface>>
class GameDefinitionViewModel <<State>>

interface ICreatorPanelActions <<interface>>
interface IGameListActions <<interface>>
interface IScenarioEditorActions <<interface>>
interface IActionDefinitionActions <<interface>>

GameDefinitionWindows .u.|> IGameDefinitionWindows
GameDefinitionWindows --> GameDefinitionView
GameDefinitionWindows --> GameParametersPanel
GameDefinitionWindows --> MessageDialog

CreatorPanelView --> IGameDefinitionActions : onCreateGame
CreatorPanelView --> IGameListActions : onOpenGameList (PU25)
GameDefinitionView --> IGameDefinitionActions
GameDefinitionView --> GameDefinitionViewModel
GameDefinitionView --> IScenarioEditorActions : onOpenScenarioEditor (PU56)
GameDefinitionView --> IActionDefinitionActions : onAddAction (PU51)
GameDefinitionView --> ICreatorPanelActions : "Anuluj"
GameParametersPanel --> IGameDefinitionActions
GameParametersPanel --> GameDefinitionViewModel
ParametersSavedMessageDialog --> IGameDefinitionActions
IncorrectDataMessageDialog --> IGameDefinitionActions
SaveErrorMessageDialog --> IGameDefinitionActions
LoadErrorMessageDialog --> IGameDefinitionActions
GameSavedMessageDialog --> IGameListActions : onOpenGameList (PU25)
GameSubmittedMessageDialog --> ICreatorPanelActions : onOpenCreatorPanel

note right of GameDefinitionView
    Ten sam widok dla nowej gry (/creator/games/new)
    i istniejącej (/creator/games/{gameId}).
    "Edytuj scenariusz gry" (PU56) i "Zdefiniuj akcję" (PU51)
    są aktywne po pierwszym zapisie parametrów.
    "Dodaj nowy czujnik" (PU50) i "Edytuj mapę gry" (PU60)
    są nieaktywne do czasu implementacji tych PU.
    Przejścia do innych PU widok woła na ich prezenterach.
end note
@enduml
```

</div>

![](rendered/game-definition-view.svg)
