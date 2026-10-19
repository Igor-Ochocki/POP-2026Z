<div hidden>

```
@startuml interfaces
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam nodesep 26
skinparam ranksep 34
skinparam linetype polyline

title Specyfikacja interfejsów (frontend)

package "View Models & DTOs" {
    class GameMetadataDTO <<DTO>> {
        + gameId: string
        + title: string
        + description: string
        + minPlayers: number
        + maxPlayers: number
        + durationMinutes: number
        + requiresInvitation: boolean
        + tags: string[*]
        + status: string
    }

    class TaskDTO <<DTO>> {
        + taskId: string
        + title: string
        + narrative: string
        + interactionType: string
        + interactionTargetId: string
        + requiredPlayerLevel: number
        + timeLimitMinutes: number
        + rewardType: string
        + rewardValue: string
    }

    class ActionDTO <<DTO>> {
        + actionId: string
        + name: string
        + actionType: string
        + outcomeType: string
        + outcomeValue: string
    }

    class TimeSlotDTO <<DTO>> {
        + slotId: string
        + gameId: string
        + startTime: string
        + endTime: string
        + location: string
        + isAvailable: boolean
        + basePrice: number
    }

    class ReservationSummaryDTO <<DTO>> {
        + reservationId: string
        + slotId: string
        + gameId: string
        + organizerId: string
        + participantCount: number
        + totalCost: number
        + status: string
        + isPaid: boolean
    }

    class GameDefinitionViewModel <<State>> {
        + activeGame: GameMetadataDTO
        + availableActionTypes: string[*]
        + definedActions: ActionDTO[*]
        + scenarioTasks: TaskDTO[*]
        + validationErrors: string[*]
        + isDirty: boolean
        + isSubmitting: boolean
        + statusNotification: string
    }

    class CalendarViewModel <<State>> {
        + selectedGameId: string
        + availableSlots: TimeSlotDTO[*]
        + selectedSlot: TimeSlotDTO
        + activeReservation: ReservationSummaryDTO
        + isConfirmationDialogOpen: boolean
        + isSessionExpired: boolean
        + errorMessage: string
    }
}

package "View Actions" {
    interface IGameDefinitionActions {
        + state: GameDefinitionViewModel
        + onSaveMetadata(metadata: GameMetadataDTO): void
        + onSaveDraft(): void
        + onSubmitForReview(): void
        + onCancelGameCreation(): void
        + onSaveAction(action: ActionDTO): void
        + onOpenScenarioEditor(gameId: string): void
        + onSaveTask(task: TaskDTO): void
        + onCancelTaskDefinition(): void
    }

    interface ICalendarActions {
        + state: CalendarViewModel
        + onOpenCalendar(gameId: string): void
        + onSelectTimeSlot(slotId: string): void
        + onConfirmReservation(participantCount: number): void
        + onCancelReservation(): void
        + onProceedToPayment(reservationId: string): void
    }
}

IGameDefinitionActions ..> GameDefinitionViewModel : presents
ICalendarActions ..> CalendarViewModel : presents

GameDefinitionViewModel *-- GameMetadataDTO
GameDefinitionViewModel *-- ActionDTO
GameDefinitionViewModel *-- TaskDTO
CalendarViewModel *-- TimeSlotDTO
CalendarViewModel *-- ReservationSummaryDTO

@enduml
```

</div>

![](rendered/interfaces.svg)
