<div hidden>

```
@startuml game-definition-presenter
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline

title PU49 Zdefiniowanie gry - presenter

class useGameDefinition <<Hook>> {
    + onCreateGame()
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
    - validateParameters(form: GameParametersForm): GameParametersErrors
    - toCreatePayload(game: GameMetadataDTO): GameCreatePayload
    - fromResponsePayload(data: GameResponsePayload): GameMetadataDTO
    - saveGame(asDraft: boolean)
}

interface IGameDefinitionActions <<interface>> {
    + onCreateGame()
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

interface IGameDefinitionWindows <<interface>> {
    + showGameDefinitionView()
    + showGameParametersView()
    + showParametersSavedMessageDialog()
    + showIncorrectDataMessageDialog()
    + showGameSavedMessageDialog()
    + showGameSubmittedMessageDialog()
    + showSaveErrorMessageDialog()
}

interface ICreatorPanelActions <<interface>> {
    + onOpenCreatorPanel()
}

class useCreatorPanel <<Hook>> {
    + onOpenCreatorPanel()
}

interface IGameListActions <<interface>> {
    + onOpenGameList()
}

interface IScenarioEditorActions <<interface>> {
    + onOpenScenarioEditor(gameId: string)
}

interface ISensorDefinitionActions <<interface>> {
    + onOpenSensorDefinition(gameId: string)
}

interface IGamesApi <<interface>> {
    + saveGame(metadata: GameCreatePayload, asDraft: boolean): Promise<GameResponsePayload>
    + submitToReviewer(gameId: string): Promise<boolean>
}

class GameCreatePayload {
    + title: string
    + description: string
    + min_players: number
    + max_players: number
    + duration_minutes: number
    + requires_invitation: boolean
    + tags: string[*]
}

class GameResponsePayload {
    + game_id: string
    + status: string
}

class GameDefinitionViewModel <<State>> {
    + activePanelType: GameDefinitionPanelTypes
    + activeGame: GameMetadataDTO | null
    + validationErrors: GameParametersErrors
    + isSubmitting: boolean
    + dialogType: GameDefinitionDialogTypes | null
}

enum GameDefinitionPanelTypes {
    definition
    parameters
}

enum GameDefinitionDialogTypes {
    parametersSaved
    incorrectData
    gameSaved
    gameSubmitted
    saveError
}

class GameParametersForm {
    + title: string
    + description: string
    + category: GameCategory | ''
    + minPlayers: string
    + maxPlayers: string
    + durationMinutes: string
    + requiresInvitation: boolean
}

enum GameCategory {
    Fantasy
    Science Fiction
    Historyczna
    Kryminalna
    Horror
    Przygodowa
}

useGameDefinition .u.|> IGameDefinitionActions
useGameDefinition -u-> IGameDefinitionWindows
useCreatorPanel .u.|> ICreatorPanelActions
useGameDefinition --> ICreatorPanelActions
useGameDefinition --> IGameListActions
useGameDefinition --> IScenarioEditorActions
useGameDefinition --> ISensorDefinitionActions
useGameDefinition --> IGamesApi : apiClient.games
useGameDefinition *-- "1" GameDefinitionViewModel : state

GameDefinitionViewModel *-- "1" GameParametersForm : parametersForm
GameResponsePayload -u-|> GameCreatePayload
IGamesApi ..> GameCreatePayload
IGamesApi ..> GameResponsePayload

note right of GameDefinitionViewModel
    GameMetadataDTO: interfaces.md.
end note

note right of GameCategory
    Ta sama lista co na backendzie.
    Kategoria trafia do tags[0].
end note

note bottom of IGamesApi
    Payloady odpowiadają GameCreateSchema
    i GameResponseSchema z backendu.
end note
@enduml
```

</div>

![](rendered/game-definition-presenter.svg)
