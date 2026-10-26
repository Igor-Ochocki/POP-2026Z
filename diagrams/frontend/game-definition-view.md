<div hidden>

```
@startuml game-definition-view
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline

title PU49 Zdefiniowanie gry - widok

class CreatorPanelView {
    + show()
    + onCreateGameClick()
}

class GameListView
class SensorDefinitionView
class ScenarioEditorView

class GameDefinitionView {
    + show(game: GameMetadataDTO | null, isSubmitting: boolean)
    + onEditParametersClick()
    + onAddSensorClick()
    + onEditScenarioClick()
    + onSaveAndSubmitClick()
    + onSaveClick()
    + onCancelClick()
}

class GameParametersPanel {
    + show(form: GameParametersForm, errors: GameParametersErrors)
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

ParametersSavedMessageDialog -u-|> MessageDialog
IncorrectDataMessageDialog -u-|> MessageDialog
GameSavedMessageDialog -u-|> MessageDialog
GameSubmittedMessageDialog -u-|> MessageDialog
SaveErrorMessageDialog -u-|> MessageDialog

interface IGameDefinitionActions <<interface>> {
    + onEditParameters()
    + onChangeParameter(field: string, value: string | boolean)
    + onSaveMetadata()
    + onParametersSavedMessageDialogConfirm()
    + onIncorrectDataMessageDialogConfirm()
    + onAddSensor()
    + onEditScenario()
    + onSaveDraft()
    + onGameSavedMessageDialogConfirm()
    + onSubmitForReview()
    + onGameSubmittedMessageDialogConfirm()
    + onSaveErrorMessageDialogConfirm()
    + onCancelGameCreation()
}

GameDefinitionView --> IGameDefinitionActions
GameParametersPanel --> IGameDefinitionActions
ParametersSavedMessageDialog --> IGameDefinitionActions
IncorrectDataMessageDialog --> IGameDefinitionActions
GameSavedMessageDialog --> IGameDefinitionActions
GameSubmittedMessageDialog --> IGameDefinitionActions
SaveErrorMessageDialog --> IGameDefinitionActions

interface IGameDefinitionWindows <<interface>> {
    + showCreatorPanelView()
    + showGameListView()
    + showGameDefinitionView()
    + showGameParametersView()
    + showSensorDefinitionView()
    + showScenarioEditorView()
    + showParametersSavedMessageDialog()
    + showIncorrectDataMessageDialog(errors: GameParametersErrors)
    + showGameSavedMessageDialog()
    + showGameSubmittedMessageDialog()
    + showSaveErrorMessageDialog()
}

class GameDefinitionWindows {
    + showCreatorPanelView()
    + showGameListView()
    + showGameDefinitionView()
    + showGameParametersView()
    + showSensorDefinitionView()
    + showScenarioEditorView()
    + showParametersSavedMessageDialog()
    + showIncorrectDataMessageDialog(errors: GameParametersErrors)
    + showGameSavedMessageDialog()
    + showGameSubmittedMessageDialog()
    + showSaveErrorMessageDialog()
}

GameDefinitionWindows .u.|> IGameDefinitionWindows

GameDefinitionWindows --> CreatorPanelView
GameDefinitionWindows --> GameListView
GameDefinitionWindows --> GameDefinitionView
GameDefinitionWindows --> GameParametersPanel
GameDefinitionWindows --> SensorDefinitionView
GameDefinitionWindows --> ScenarioEditorView
GameDefinitionWindows --> ParametersSavedMessageDialog
GameDefinitionWindows --> IncorrectDataMessageDialog
GameDefinitionWindows --> GameSavedMessageDialog
GameDefinitionWindows --> GameSubmittedMessageDialog
GameDefinitionWindows --> SaveErrorMessageDialog

CreatorPanelView ..> GameDefinitionView : "Utwórz nową grę"

note bottom of GameListView
    Widok z PU53, do czasu jego
    implementacji trasa /creator/games
    nie istnieje.
end note

note right of GameDefinitionView
    "Dodaj nowy czujnik" (scenariusz B, PU50)
    i "Edytuj scenariusz gry" (scenariusz C, PU56)
    oraz "Edytuj mapę gry" (PU60) i "Zdefiniuj akcję" (PU51)
    są nieaktywne do czasu implementacji tych przypadków użycia.
end note

note bottom of SensorDefinitionView
    Widoki z PU50 i PU56. Po ich zakończeniu
    system wraca do GameDefinitionView.
end note
@enduml
```

</div>

![](rendered/game-definition-view.svg)
