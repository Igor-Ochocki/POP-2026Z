@startuml
title PU51 Zdefiniowanie akcji - widok

skinparam classAttributeIconSize 0
skinparam shadowing false

interface IActionDefinitionWindows <<interface>> {
  +showGameDefinitionView()
  +showActionFormView(form: ActionForm, errors: ActionFormErrors, isSubmitting: boolean)
  +showActionSavedMessageDialog()
  +showIncompleteActionDataMessageDialog(errors: ActionFormErrors)
  +showActionSaveErrorMessageDialog()
}

class ActionDefinitionWindows {
  +showGameDefinitionView()
  +showActionFormView(form: ActionForm, errors: ActionFormErrors, isSubmitting: boolean)
  +showActionSavedMessageDialog()
  +showIncompleteActionDataMessageDialog(errors: ActionFormErrors)
  +showActionSaveErrorMessageDialog()
}

IActionDefinitionWindows <|.. ActionDefinitionWindows

class MessageDialog {
  +show(title: string, message: string)
  +onOkClick()
}

class ActionSavedMessageDialog
class IncompleteActionDataMessageDialog
class ActionSaveErrorMessageDialog

MessageDialog <|-- ActionSavedMessageDialog
MessageDialog <|-- IncompleteActionDataMessageDialog
MessageDialog <|-- ActionSaveErrorMessageDialog

class GameDefinitionView {
  +onDefineActionClick()
}

class ActionFormView {
  +show(form: ActionForm, errors: ActionFormErrors, isSubmitting: boolean)
  +onFieldChange(field: string, value: string)
  +onSaveAndCloseClick()
  +onCancelClick()
}

interface IActionDefinitionActions <<interface>> {
  +onDefineAction()
  +onChangeActionField(field: string, value: string)
  +onSaveAction()
  +onCancelActionDefinition()
  +onActionSavedMessageDialogConfirm()
  +onIncompleteActionDataMessageDialogConfirm()
  +onActionSaveErrorMessageDialogConfirm()
}

ActionDefinitionWindows --> GameDefinitionView
ActionDefinitionWindows --> ActionFormView
ActionDefinitionWindows --> ActionSavedMessageDialog
ActionDefinitionWindows --> IncompleteActionDataMessageDialog
ActionDefinitionWindows --> ActionSaveErrorMessageDialog

GameDefinitionView --> IActionDefinitionActions
ActionFormView --> IActionDefinitionActions
ActionSavedMessageDialog --> IActionDefinitionActions
IncompleteActionDataMessageDialog --> IActionDefinitionActions
ActionSaveErrorMessageDialog --> IActionDefinitionActions

GameDefinitionView ..> ActionFormView : Zdefiniuj akcję




@enduml
