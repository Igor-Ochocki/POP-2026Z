```
@startuml
class NewTaskView {
    show()
    onClick()
}

class ConfirmationDialog {
    show()
    onClick()
}

class MessageDialog {
    show()
    onClick()
}

class CancelNewTaskConfirmationDialog
CancelNewTaskConfirmationDialog -u-|> ConfirmationDialog

class ConflictMessageDialog
class IncorrectDataMessageDialog
class NewTaskSuccessMessageDialog
class SaveErrorMessageDialog

ConflictMessageDialog -u-|> MessageDialog
IncorrectDataMessageDialog -u-|> MessageDialog
NewTaskSuccessMessageDialog -u-|> MessageDialog
SaveErrorMessageDialog -u-|> MessageDialog

interface INewTaskActions <<interface>> {
    onNewTaskSelect()
    onSubmitNewTask()
    onCancelNewTask()
    onCancelNewTaskConfirm()
    onCancelNewTaskCancel()
    onNewTaskSuccessMessageDialogConfirm()
    onIncorrectDataMessageDialogConfirm()
    onConflictMessageDialogConfirm()
    onSaveErrorMessageDialogConfirm()
    onChangeParameter(field: string, value: string | number)
}

INewTaskActions <-u- CancelNewTaskConfirmationDialog
INewTaskActions <-u- ConflictMessageDialog
INewTaskActions <-u- IncorrectDataMessageDialog
INewTaskActions <-u- NewTaskSuccessMessageDialog
INewTaskActions <-u- SaveErrorMessageDialog
INewTaskActions <-u- NewTaskView

NewTaskWindows --u-> CancelNewTaskConfirmationDialog
NewTaskWindows --u-> ConflictMessageDialog
NewTaskWindows --u-> IncorrectDataMessageDialog
NewTaskWindows --u-> NewTaskSuccessMessageDialog
NewTaskWindows --u-> SaveErrorMessageDialog
NewTaskWindows --u-> NewTaskView

interface INewTaskWindows <<interface>> {
    showNewTaskView()
    showCancelNewTaskConfirmationDialog()
    showConflictMessageDialog()
    showIncorrectDataMessageDialog()
    showNewTaskSuccessMessageDialog()
    showSaveErrorMessageDialog()
    hideDialogs()
}

class NewTaskWindows {
    showNewTaskView()
    showCancelNewTaskConfirmationDialog()
    showConflictMessageDialog()
    showIncorrectDataMessageDialog()
    showNewTaskSuccessMessageDialog()
    showSaveErrorMessageDialog()
    hideDialogs()
}

NewTaskWindows .d.|> INewTaskWindows
@enduml
```

![](rendered/new-task-view.svg)
