```
@startuml
class useNewTask {
    onNewTaskSelect()
    onSubmitNewTask()
    onCancelNewTask()
    onCancelNewTaskConfirm()
    onCancelNewTaskCancel()
    onNewTaskSuccessMessageDialogConfirm()
    onIncorrectDataMessageDialogConfirm()
    onConflictMessageDialogConfirm()
    onChangeParameter(field: string, value: string | number)
}

interface INewTaskActions <<interface>> {
    onNewTaskSelect()
    onSubmitNewTask()
    onCancelNewTask()
    onCancelNewTaskConfirm()
    onCancelNewTaskCancel()
    onNewTaskSuccessMessageDialogConfirm()
    onIncorrectDataMessageDialogConfirm()
    onConflictMessageDialogConfirm()
    onChangeParameter(field: string, value: string | number)
}

useNewTask .|> INewTaskActions

useNewTask --> IScenarioApi
useNewTask -u-> INewTaskWindows

interface IScenarioApi <<interface>> {
    addTask(gameId :string, task :TaskCreateDTO)
}

interface INewTaskWindows <<interface>> {
    showNewTaskView()
    showCancelNewTaskConfirmationDialog()
    showConflictMessageDialog()
    showIncorrectDataMessageDialog()
    showNewTaskSuccessMessageDialog()
    hideDialogs()
}

class NewTaskViewModel {
    title: string
    narrative: string
    rewardType: string
    rewardValue: string
    requiredPlayerLevel: number
    interactionType: string
    timeLimitMinutes: number | null
    cancelNewTaskConfirmationDialogOpen: boolean
    newTaskSuccessMessageDialogOpen: boolean
    conflictMessageDialogOpen: boolean
    incorrectDataMessageDialogOpen: boolean
}

useNewTask *-l- NewTaskViewModel :state
@enduml
```

![](rendered/new-task-presenter.svg)
