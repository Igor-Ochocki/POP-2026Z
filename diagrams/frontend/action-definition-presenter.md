<div hidden>
  
```
@startuml
title PU51 Zdefiniowanie akcji - prezenter

skinparam classAttributeIconSize 0
skinparam shadowing false

interface IActionDefinitionWindows <<interface>> {
  +showGameDefinitionView()
  +showActionFormView()
  +showActionSavedMessageDialog()
  +showIncompleteActionDataMessageDialog()
  +showActionSaveErrorMessageDialog()
}

interface IActionDefinitionActions <<interface>> {
  +onAddAction()
  +onChangeActionField(field: string, value: string)
  +onSaveAction()
  +onCancelActionDefinition()
  +onActionSavedMessageDialogConfirm()
  +onIncompleteActionDataMessageDialogConfirm()
  +onActionSaveErrorMessageDialogConfirm()
}

enum ActionType {
  MOVEMENT
  ATTACK
  USE_ITEM
  DIALOGUE
  CUSTOM
  MINI_GAME
}

enum EffectKind {
  CHANGE_STAT
  ADD_ITEM
  REMOVE_ITEM
  CHANGE_LOCATION
  SET_FLAG
  START_MINI_GAME
}

enum ActionDefinitionPanelTypes {
  gameDefinition
  actionForm
}

enum ActionDefinitionDialogTypes {
  incompleteData
  actionSaved
  saveError
}

class useActionDefinition <<Hook>> {
  +onAddAction()
  +onChangeActionField(field: string, value: string)
  +onSaveAction()
  +onCancelActionDefinition()
  +onActionSavedMessageDialogConfirm()
  +onIncompleteActionDataMessageDialogConfirm()
  +onActionSaveErrorMessageDialogConfirm()
  -saveAction()
}

interface ActionsApi <<interface>> {
  +createAction(gameId: string, action: ActionDto): Promise<ActionDto>
}

class ActionValidationError <<Error>>

class ActionDefinitionViewModel <<State>> {
  +gameId: string
  +activePanelType: ActionDefinitionPanelTypes
  +isSubmitting: boolean
  +dialogType: ActionDefinitionDialogTypes | null
}

class ActionForm {
  +name: string
  +type: ActionType | ''
  +effectKind: EffectKind | ''
  +effectValue: string
}

class ActionDto <<DTO>> {
  +id?: string
  +gameId: string
  +name: string
  +type: ActionType
  +effectKind: EffectKind
  +effectValue: string
}

useActionDefinition --> IActionDefinitionWindows
useActionDefinition ..|> IActionDefinitionActions
useActionDefinition --> ActionsApi : apiClient.actions
useActionDefinition *-- "1" ActionDefinitionViewModel

ActionDefinitionViewModel *-- "1" ActionForm : form

ActionsApi ..> ActionDto
ActionsApi ..> ActionValidationError

@enduml
```
<\div>
![](rendered/action-definition-presenter.svg)
