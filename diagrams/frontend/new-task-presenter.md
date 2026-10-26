```
@startuml
class useNewTask {
    onSubmitNewTask(task :TaskDTO)
    onCancelNewTask()
    onCancelNewTaskConfirm()
    onCancelNewTaskCancel()
    onNewTaskSuccessMessageDialogConfirm()
    onIncorrectDataMessageDialogConfirm()
    onConflictMessageDialogConfirm()
}

interface INewTaskActions <<interface>> {
    onSubmitNewTask(task :TaskDTO)
    onCancelNewTask()
    onCancelNewTaskConfirm()
    onCancelNewTaskCancel()
    onNewTaskSuccessMessageDialogConfirm()
    onIncorrectDataMessageDialogConfirm()
    onConflictMessageDialogConfirm()
}

useNewTask .|> INewTaskActions

useNewTask --> IGamesApi
useNewTask -u-> INewTaskWindows

interface IGamesApi <<interface>> {
    addTask(gameId :string, task :TaskDTO)
}

interface INewTaskWindows <<interface>> {
    showNewTaskView()
    showCancelNewTaskConfirmationDialog()
    showConflictMessageDialog()
    showIncorrectDataMessageDialog()
    showNewTaskSuccessMessageDialog()
}
@enduml
```

![](rendered/new-task-presenter.svg)
