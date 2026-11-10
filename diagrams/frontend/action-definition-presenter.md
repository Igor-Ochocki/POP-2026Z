<div hidden>

```
@startuml action-definition-presenter
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU51 Zdefiniowanie akcji - presenter

interface IActionDefinitionActions <<interface>> {
    + onAddAction(gameId: string)
    + onChangeParameter(field: string, value: any)
    + onSaveAction()
    + onIncompleteActionDataMessageDialogConfirm()
    + onActionSaveErrorMessageDialogConfirm()
}

interface IActionDefinitionWindows <<interface>> {
    + showActionDefinitionView(gameId: string)
    + showActionSavedMessageDialog()
    + showIncompleteActionDataMessageDialog()
    + showActionSaveErrorMessageDialog()
    + hideDialogs()
}

class useActionDefinition <<Hook>> {
    - toCreateDTO(gameId: string, form: ActionForm): ActionCreateDTO | null
    - saveAction(action: ActionCreateDTO)
}

class ActionDefinitionViewModel <<State>> {
    + gameId: string
    + form: ActionForm
    + isSubmitting: boolean
    + dialogType: ActionDefinitionDialogTypes | null
}

class ActionForm {
    + name: string
    + actionType: ActionType | ''
    + outcomeType: EffectKind | ''
    + outcomeValue: string
}

enum ActionDefinitionDialogTypes {
    incompleteData
    actionSaved
    saveError
}

interface IActionsApi <<interface>>
class ActionCreateDTO <<DTO>>
enum ActionType
enum EffectKind

useActionDefinition .u.|> IActionDefinitionActions
useActionDefinition -u-> IActionDefinitionWindows
useActionDefinition *-- "1" ActionDefinitionViewModel : state
ActionDefinitionViewModel *-- "1" ActionForm : form
ActionDefinitionViewModel ..> ActionDefinitionDialogTypes
ActionForm ..> ActionType
ActionForm ..> EffectKind
useActionDefinition ..> ActionCreateDTO
useActionDefinition --> IActionsApi : apiClient.actions\ncreateAction

note right of useActionDefinition
    onSaveAction: niepełny formularz albo 422 z backendu
    -> showIncompleteActionDataMessageDialog,
    inny błąd -> showActionSaveErrorMessageDialog.
    Hook nie wywołuje API przy montowaniu, więc
    GameDefinitionView może go użyć dla kafelka.
end note

note bottom of IActionsApi
    DTO, enumy i porty API: interfaces.md
end note
@enduml
```

</div>

![](rendered/action-definition-presenter.svg)
