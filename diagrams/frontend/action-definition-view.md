<div hidden>

```
@startuml action-definition-view
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU51 Zdefiniowanie akcji - widok

class ActionDefinitionView <<View>> {
    + onFieldChange(field: string, value: string)
    + onSaveAndCloseClick()
    + onCancelClick()
}

class MessageDialog {
    + show(title: string, message: string)
    + onOkClick()
}

class ActionSavedMessageDialog
class IncompleteActionDataMessageDialog
class ActionSaveErrorMessageDialog

ActionSavedMessageDialog -u-|> MessageDialog
IncompleteActionDataMessageDialog -u-|> MessageDialog
ActionSaveErrorMessageDialog -u-|> MessageDialog

class ActionDefinitionWindows
interface IActionDefinitionWindows <<interface>>
interface IActionDefinitionActions <<interface>>
class ActionDefinitionViewModel <<State>>
interface IGameDefinitionActions <<interface>>

ActionDefinitionWindows .u.|> IActionDefinitionWindows
ActionDefinitionWindows --> ActionDefinitionView
ActionDefinitionWindows --> MessageDialog

ActionDefinitionView --> IActionDefinitionActions
ActionDefinitionView --> ActionDefinitionViewModel
IncompleteActionDataMessageDialog --> IActionDefinitionActions
ActionSaveErrorMessageDialog --> IActionDefinitionActions
ActionDefinitionView --> IGameDefinitionActions : "Anuluj" - onOpenGame (PU49)
ActionSavedMessageDialog --> IGameDefinitionActions : onOpenGame (PU49)

note bottom of ActionDefinitionView
    Po zapisie akcji albo anulowaniu widok wraca
    do definicji tej samej gry (PU49).
end note
@enduml
```

</div>

![](rendered/action-definition-view.svg)
