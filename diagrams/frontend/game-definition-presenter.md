<div hidden>

```
@startuml game-definition-presenter
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU49 Zdefiniowanie gry - presenter

interface IGameDefinitionActions <<interface>> {
    + onCreateGame()
    + onOpenGame(gameId: string)
    + onEditParameters()
    + onChangeParameter(field: string, value: any)
    + onSaveMetadata()
    + onParametersSavedMessageDialogConfirm()
    + onIncorrectDataMessageDialogConfirm()
    + onSaveDraft()
    + onSubmitForReview()
    + onSaveErrorMessageDialogConfirm()
    + onLoadErrorMessageDialogConfirm()
}

interface IGameDefinitionWindows <<interface>> {
    + showGameDefinitionView()
    + showGameParametersView()
    + showParametersSavedMessageDialog()
    + showIncorrectDataMessageDialog()
    + showGameSavedMessageDialog()
    + showGameSubmittedMessageDialog()
    + showSaveErrorMessageDialog()
    + showLoadErrorMessageDialog()
}

class useGameDefinition <<Hook>> {
    - validateParameters(form: GameParametersForm): GameParametersErrors
    - toMetadata(form: GameParametersForm, previous: GameMetadataDTO | null): GameMetadataDTO
    - toForm(game: GameMetadataDTO): GameParametersForm
    - saveDraft(game: GameMetadataDTO): Promise<GameMetadataDTO>
    - saveGame(asDraft: boolean)
}

interface ICreatorPanelActions <<interface>> {
    + onOpenCreatorPanel()
}

class useCreatorPanel <<Hook>>

class GameDefinitionViewModel <<State>> {
    + activePanelType: GameDefinitionPanelTypes
    + activeGame: GameMetadataDTO | null
    + parametersForm: GameParametersForm
    + validationErrors: GameParametersErrors
    + isSubmitting: boolean
    + dialogType: GameDefinitionDialogTypes | null
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
    loadError
}

enum GameCategory {
    Fantasy
    Science Fiction
    Historyczna
    Kryminalna
    Horror
    Przygodowa
}

interface IGamesApi <<interface>>
class GameMetadataDTO <<DTO>>

useGameDefinition .u.|> IGameDefinitionActions
useGameDefinition -u-> IGameDefinitionWindows
useCreatorPanel .u.|> ICreatorPanelActions
useGameDefinition *-- "1" GameDefinitionViewModel : state
GameDefinitionViewModel *-- "1" GameParametersForm : parametersForm
GameDefinitionViewModel ..> GameDefinitionPanelTypes
GameDefinitionViewModel ..> GameDefinitionDialogTypes
GameDefinitionViewModel ..> GameMetadataDTO : activeGame
GameParametersForm ..> GameCategory
useGameDefinition --> IGamesApi : apiClient.games\ngetGame, saveGame,\neditGame, submitToReviewer

note right of useGameDefinition
    Trasa /creator/games/{gameId} (nowa gra: gameId = new).
    onSaveMetadata zapisuje parametry od razu jako szkic
    (saveDraft: POST albo PUT z as_draft = true) - gra dostaje
    gameId i trasa zmienia się na jej id. Od tego momentu
    dostępne są PU wymagające gameId (PU51, PU56).
    Na trasie istniejącej gry dane wczytuje getGame.
    onOpenGame(gameId) otwiera definicję gry z innych PU.
end note

note bottom of IGamesApi
    DTO i porty API: interfaces.md
end note

note right of GameCategory
    Ta sama lista co na backendzie,
    kategoria trafia do tags[0].
end note
@enduml
```

</div>

![](rendered/game-definition-presenter.svg)
