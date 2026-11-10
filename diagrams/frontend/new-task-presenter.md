<div hidden>

```
@startuml new-task-presenter
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU57 Projektowanie zadania w scenariuszu gry - presenter

interface INewTaskActions <<interface>> {
    + onNewTaskSelect()
    + onChangeParameter(field: string, value: any)
    + onSubmitNewTask()
    + onCancelNewTask()
    + onCancelNewTaskConfirm()
    + onCancelNewTaskCancel()
    + onNewTaskSuccessMessageDialogConfirm()
    + onIncorrectDataMessageDialogConfirm()
    + onConflictMessageDialogConfirm()
    + onSaveErrorMessageDialogConfirm()
}

interface INewTaskWindows <<interface>> {
    + showNewTaskView()
    + showCancelNewTaskConfirmationDialog()
    + showConflictMessageDialog()
    + showIncorrectDataMessageDialog()
    + showNewTaskSuccessMessageDialog()
    + showSaveErrorMessageDialog()
    + hideDialogs()
}

class useNewTask <<Hook>> {
    - isComplete(state: NewTaskViewModel): boolean
}

class NewTaskViewModel <<State>> {
    + title: string
    + narrative: string
    + rewardType: string
    + rewardValue: string
    + requiredPlayerLevel: number
    + interactionType: string
    + timeLimitMinutes: number | null
    + cancelNewTaskConfirmationDialogOpen: boolean
    + newTaskSuccessMessageDialogOpen: boolean
    + conflictMessageDialogOpen: boolean
    + incorrectDataMessageDialogOpen: boolean
    + saveErrorMessageDialogOpen: boolean
}

interface IScenariosApi <<interface>>
class TaskCreateDTO <<DTO>>

useNewTask .u.|> INewTaskActions
useNewTask -u-> INewTaskWindows
useNewTask *-- "1" NewTaskViewModel : state
useNewTask ..> TaskCreateDTO
useNewTask --> IScenariosApi : apiClient.scenarios\naddTask

note right of useNewTask
    onSubmitNewTask: brak wymaganych pól -> showIncorrectDataMessageDialog
    bez wywołania API; 422 -> ten sam dialog; 409 -> showConflictMessageDialog;
    inny błąd -> showSaveErrorMessageDialog.
    Po sukcesie albo anulowaniu widok wraca do edytora scenariusza (PU56).
end note

note bottom of IScenariosApi
    DTO i porty API: interfaces.md.
    Backend PU57 (POST /games/{id}/scenario/tasks): backend/new-task.md.
end note
@enduml
```

</div>

![](rendered/new-task-presenter.svg)
