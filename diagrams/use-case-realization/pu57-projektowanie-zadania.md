<div hidden>

```
@startuml pu57-projektowanie-zadania
skinparam shadowing false
skinparam roundcorner 4
skinparam sequenceMessageAlign left
skinparam responseMessageBelowArrow true
skinparam maxMessageSize 260
skinparam ParticipantPadding 8
hide footbox
autonumber

title PU57 Projektowanie zadania w scenariuszu gry - realizacja przypadku użycia (komponenty i interfejsy)

actor "Projektant" as U
box "Frontend" #F4F8FF
    participant "ScenarioEditorView" as VS <<View>>
    participant "NewTaskView" as V <<View>>
    participant "INewTaskActions" as IA <<interface>>
    participant "useNewTask" as P <<Hook>>
    participant "INewTaskWindows" as IW <<interface>>
    participant "IScenariosApi" as IAPI <<interface>>
    participant "scenariosApi" as API <<API>>
end box
box "Backend" #FFF8EE
    participant "IScenariosApi\n/api/v1/games/{id}/scenario" as REST <<interface>>
    participant "ScenariosController" as C <<Controller>>
    participant "IScenariosService" as IS <<interface>>
    participant "ScenariosService" as S <<Service>>
end box
database "SQLite" as DB

note over U, VS
    Warunek początkowy: w edytorze wyświetlony
    jest scenariusz gry (PU56).
end note

== Kroki 1-2 ==
U -> VS : "Dodaj zadanie"
VS -> IA : onNewTaskSelect()
IA -> P : onNewTaskSelect()
P -> IW : showNewTaskView()
IW --> U : formularz definicji zadania

== Krok 3 ==
loop każde pole formularza
    U -> V : zmiana pola
    V -> IA : onChangeParameter(field, value)
    IA -> P : onChangeParameter(field, value)
end

alt Kroki 4-6: zapis zadania
    U -> V : "Zapisz i zamknij"
    V -> IA : onSubmitNewTask()
    IA -> P : onSubmitNewTask()
    alt Alternatywny 1: brak wymaganych pól (sprawdzenie przed wysłaniem)
        P -> IW : showIncorrectDataMessageDialog()
        IW --> U : "Podane dane zadania są błędne" (powrót do kroku 3)
    else dane kompletne
        P -> IAPI : addTask(gameId, userId, task)
        IAPI -> API : addTask(gameId, userId, task)
        API -> REST : POST /games/{gameId}/scenario/tasks?user_id
        REST -> C : add_task(game_id, user_id, dto)
        C -> IS : add_task(game_id, user_id, dto)
        IS -> S : add_task(game_id, user_id, dto)
        S -> DB : SELECT games, scenarios, tasks
        alt Kroki 5-6: zapis udany
            S -> DB : INSERT tasks (position = liczba zadań)
            S --> C : TaskSchema
            C --> API : 201 TaskSchema
            API --> P : TaskDTO
            P -> IW : showNewTaskSuccessMessageDialog()
            IW --> U : "Nowe zadanie zostało dodane."
            U -> V : "OK"
            V -> IA : onNewTaskSuccessMessageDialogConfirm()
            IA -> P : onNewTaskSuccessMessageDialogConfirm()
            P --> VS : powrót do edytora
            ref over VS : PU56 - ponowne wczytanie scenariusza
        else Alternatywny 1: dane niepoprawne (walidacja schematu)
            C --> API : 422
            API --> P : ApiError(422)
            P -> IW : showIncorrectDataMessageDialog()
            IW --> U : "Podane dane zadania są błędne" (powrót do kroku 3)
        else Alternatywny 2: konflikt powiązań (obiekt interakcji już użyty)
            S --> API : 409 (ConflictError)
            API --> P : ApiError(409)
            P -> IW : showConflictMessageDialog()
            IW --> U : ostrzeżenie o konflikcie powiązań
            U -> V : "OK"
            V -> IA : onConflictMessageDialogConfirm()
            IA -> P : onConflictMessageDialogConfirm()
            P -> IW : hideDialogs()
            note right of U : wybór innego obiektu interakcji,\npowrót do kroku 3
        else inny błąd (gra nie istnieje albo cudza - 404, brak połączenia)
            API --> P : ApiError
            P -> IW : showSaveErrorMessageDialog()
            IW --> U : "Nie udało się zapisać zadania. Spróbuj ponownie."
        end
    end
else Alternatywny 3: anulowanie
    U -> V : "Anuluj"
    V -> IA : onCancelNewTask()
    IA -> P : onCancelNewTask()
    P -> IW : showCancelNewTaskConfirmationDialog()
    IW --> U : zapytanie o porzucenie zmian
    alt potwierdzenie wyjścia bez zapisu
        U -> V : "Potwierdź"
        V -> IA : onCancelNewTaskConfirm()
        IA -> P : onCancelNewTaskConfirm()
        P --> VS : powrót do edytora (struktura scenariusza bez zmian)
    else powrót do formularza
        U -> V : "Anuluj"
        V -> IA : onCancelNewTaskCancel()
        IA -> P : onCancelNewTaskCancel()
        P -> IW : hideDialogs()
    end
end
@enduml
```

</div>

![](rendered/pu57-projektowanie-zadania.svg)
