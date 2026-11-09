<div hidden>

```
@startuml action-definition-view
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline

title PU51 Zdefiniowanie akcji - widok

class GameDefinitionView {
    + onDefineActionClick()
}

class ActionDefinitionView {
    + show(form: ActionForm, isSubmitting: boolean)
    + onFieldChange(field: string, value: string)
    + onSaveAndCloseClick()
    + onCancelClick()
}

class MessageDialog {
    + show(title: string, message: string)
    + onOkClick()
}

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

interface IGameDefinitionActions <<interface>> {
    + onOpenGame(gameId: string)
}

class ActionDefinitionWindows

ActionDefinitionWindows .u.|> IActionDefinitionWindows
ActionDefinitionWindows --> ActionDefinitionView
ActionDefinitionWindows --> MessageDialog

GameDefinitionView --> IActionDefinitionActions : "Zdefiniuj akcję"
ActionDefinitionView --> IActionDefinitionActions
MessageDialog --> IActionDefinitionActions : błędy
ActionDefinitionView --> IGameDefinitionActions : "Anuluj" (PU49)
MessageDialog --> IGameDefinitionActions : "Sukces" (PU49)

GameDefinitionView ..> ActionDefinitionView : "Zdefiniuj akcję"

note right of GameDefinitionView
    Po zapisie akcji albo anulowaniu widok wraca
    do definicji tej samej gry (onOpenGame).
end note
@enduml
```

</div>

![](rendered/action-definition-view.svg)
