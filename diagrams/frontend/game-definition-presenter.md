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
    - state: GameDefinitionViewModel <<useState>>
    + onEditParameters()
    + onChangeParameter(field: string, value: string | boolean)
    + onSaveMetadata()
    + onSaveDraft()
    + onSubmitForReview()
    + onCancelGameCreation()
    + onOpenScenarioEditor()
    + onOpenMapEditor()
    + onOpenActionDefinition()
    + onCloseDialog()
    - validateParameters(form: GameParametersForm): GameParametersErrors
    - saveGame(asDraft: boolean)
}

interface IGameDefinitionActions <<interface>> {
    + onEditParameters()
    + onChangeParameter(field: string, value: string | boolean)
    + onSaveMetadata()
    + onSaveDraft()
    + onSubmitForReview()
    + onCancelGameCreation()
    + onOpenScenarioEditor()
    + onOpenMapEditor()
    + onOpenActionDefinition()
    + onCloseDialog()
}

class GameDefinitionViewModel <<State>> {
    + activePanel: "definition" | "parameters"
    + activeGame: GameMetadataDTO | null
    + parametersForm: GameParametersForm
    + validationErrors: GameParametersErrors
    + isDirty: boolean
    + isSubmitting: boolean
    + dialog: GameDefinitionDialog | null
}

class GameParametersForm {
    + title: string
    + description: string
    + category: string
    + minPlayers: string
    + maxPlayers: string
    + durationMinutes: string
    + requiresInvitation: boolean
}

class GameDefinitionDialog {
    + title: string
    + message: string
    + redirectTo: string | null
    + returnToDefinition: boolean
}

class GameMetadataDTO <<DTO>> {
    + gameId: string
    + title: string
    + description: string
    + minPlayers: number
    + maxPlayers: number
    + durationMinutes: number
    + requiresInvitation: boolean
    + tags: string[*]
    + status: string
}

interface GamesApi <<interface>> {
    + saveGame(metadata: GameMetadataDTO, asDraft: boolean): Promise<GameMetadataDTO>
    + submitToReviewer(gameId: string): Promise<boolean>
}

useGameDefinition .u.|> IGameDefinitionActions
useGameDefinition *-- GameDefinitionViewModel : owns
useGameDefinition --> GamesApi : apiClient.games

GameDefinitionViewModel *-- GameParametersForm
GameDefinitionViewModel *-- GameDefinitionDialog
GameDefinitionViewModel *-- GameMetadataDTO
GamesApi ..> GameMetadataDTO
@enduml
```

</div>

![](rendered/game-definition-presenter.svg)
