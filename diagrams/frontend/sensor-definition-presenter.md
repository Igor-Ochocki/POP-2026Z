<div hidden>

```
@startuml sensor-definition-presenter
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU50 Zdefiniowanie czujnika - presenter

interface ISensorDefinitionWindows <<interface>> {
    + showSensorDefinitionView()
    + showSensorPositionSelector()
    + showDataErrorDialog()
    + showSaveErrorDialog()
    + showSaveSuccessDialog()
}

interface SensorDefinitionActions <<interface>> {
    + onChangeParameter(field: string, value: any)
    + onCreateSensor()
    + onOpenPositionSelector()
    + onSensorSubmit()
    + onCreateSensorCancel()
}

class useSensorDefinition <<Hook>> {
    - loadSensorTypes(setState)
    - loadActions(setState, gameId: string)
    - loadGameMap(setState, gameId: string)
    - isSensorDataValid(state: SensorDefinitionViewModel): boolean
}

class SensorDefinitionViewModel <<State>> {
    + gameId: string
    + roomId: string
    + sensorTypes: string[*]
    + actions: ActionDTO[*]
    + gameMap: GameMapDTO
    + selectedPosition: PositionDTO | null
    + selectedAction: string
    + selectedType: string
    + dataErrorDialogOpen: boolean
    + saveErrorDialogOpen: boolean
    + saveSuccessDialogOpen: boolean
    + positionSelectorOpen: boolean
}

class SensorDTO <<DTO>> {
    + type: string
    + action: string
    + position: PositionDTO
}

interface IGamesApi <<interface>> {
    + getSensorTypes(): Promise<string[]>
    + addSensor(gameId: string, userId: string, sensor: SensorDTO): Promise<SensorDTO>
}
interface IActionsApi <<interface>>

useSensorDefinition .u.|> SensorDefinitionActions
useSensorDefinition -u-> ISensorDefinitionWindows
useSensorDefinition *-- "1" SensorDefinitionViewModel : state
useSensorDefinition --> IGamesApi
useSensorDefinition --> IActionsApi
ISensorsApi ..> SensorDTO

note bottom of useSensorDefinition
    Trasa: /creator/games/:gameId/map/rooms/:roomId/add-sensor.
    onCreateSensor wczytuje typy czujników, akcje gry i mapę,
    potem otwiera widok. loadGameMap - na razie pusta (bez IMapsApi).
end note
@enduml
```

</div>

![](rendered/sensor-definition-presenter.svg)
