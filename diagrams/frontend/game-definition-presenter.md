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
    + onOpenGame(gameId: string)
    + onEditParameters()
    + onChangeParameter(field: string, value: string | boolean)
    + onSaveMetadata()
    + onParametersSavedMessageDialogConfirm()
    + onIncorrectDataMessageDialogConfirm()
    + onSaveDraft()
    + onSubmitForReview()
    + onSaveErrorMessageDialogConfirm()
    + onLoadErrorMessageDialogConfirm()
    - validateParameters(form: GameParametersForm): GameParametersErrors
    - toForm(game: GameMetadataDTO): GameParametersForm
    - saveDraft(game: GameMetadataDTO): Promise<GameMetadataDTO>
    - saveGame(asDraft: boolean)
}

interface IGameDefinitionActions <<interface>> {
    + onCreateGame()
    + onOpenGame(gameId: string)
    + onEditParameters()
    + onChangeParameter(field: string, value: string | boolean)
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

interface ICreatorPanelActions <<interface>> {
    + onOpenCreatorPanel()
}

class useCreatorPanel <<Hook>> {
    + onOpenCreatorPanel()
}

interface IGamesApi <<interface>> {
    + getGame(gameId: string, userId: string): Promise<GameResponseDTO>
    + saveGame(userId: string, metadata: GameCreateDTO, asDraft: boolean): Promise<GameResponseDTO>
    + editGame(gameId: string, userId: string, metadata: GameCreateDTO, asDraft: boolean): Promise<GameResponseDTO>
    + submitToReviewer(gameId: string, userId: string): Promise<boolean>
}

class GameCreateDTO <<DTO>> {
    + title: string
    + description: string
    + minPlayers: number
    + maxPlayers: number
    + durationMinutes: number
    + requiresInvitation: boolean
    + tags: string[*]
}

class GameResponseDTO <<DTO>> {
    + gameId: string
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
    loadError
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
useGameDefinition --> IGamesApi : apiClient.games
useGameDefinition *-- "1" GameDefinitionViewModel : state

GameDefinitionViewModel *-- "1" GameParametersForm : parametersForm
GameResponseDTO -u-|> GameCreateDTO
IGamesApi ..> GameCreateDTO
IGamesApi ..> GameResponseDTO

note top of useGameDefinition
    Trasa /creator/games/{gameId}, dla nowej gry gameId = new.
    onSaveMetadata zapisuje parametry od razu jako szkic (as_draft),
    gra dostaje gameId i trasa zmienia się na jej id - od tego
    momentu dostępne są PU wymagające gameId (scenariusz, akcje).
    Na trasie istniejącej gry dane są wczytywane przez getGame.
    onOpenGame(gameId) otwiera definicję gry z innych PU.
end note

note right of GameDefinitionViewModel
    GameMetadataDTO: interfaces.md.
end note

note right of GameCategory
    Ta sama lista co na backendzie.
    Kategoria trafia do tags[0].
end note

note bottom of IGamesApi
    DTO odpowiadają GameCreateSchema
    i GameResponseSchema z backendu.
    gamesApi mapuje camelCase <-> snake_case.
    userId to parametr user_id, do czasu
    logowania brany z ENV (VITE_DEV_USER_ID).
end note
@enduml
```

</div>

![](rendered/game-definition-presenter.svg)
