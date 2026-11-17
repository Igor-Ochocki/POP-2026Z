<div hidden>

```
@startuml sensor-definition
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU50 Zdefiniowanie czujnika - backend

interface ISensorsApi <<interface>> \n<< /api/v1/games >> {
    + <<GET /sensor_types >>\n\tget_sensor_types() : str[]
    + <<PUT /{game_id}/sensor/add >>\n\tadd_sensor(game_id: str, user_id: str, room_id: str, data: SensorSchema) : SensorSchema
}

class SensorsController implements ISensorsApi {
    - sensors_service: ISensorsService
}

interface ISensorsService <<interface>> {
    + get_sensor_types() : str[]
    + add_sensor(game_id: str, user_id: str, room_id: str, data: SensorSchema) : SensorSchema
}

SensorsController --> ISensorsService

class SensorsService implements ISensorsService {
}

class Sensor <<BaseModel>> {
    + id: str
    + name: str
    + type: str
    + action: str
    + description: str
    + position: Position
}

class SensorSchema {
    + id: str
    + name: str
    + type: str
    + action: str
    + description: str
    + position: PositionSchema
}

class Position <<BaseModel>> {
    + x: number
    + y: number
}

class PositionSchema {
    + x: number
    + y: number
}

class SaveFailedException <<Exception>> {

}

class NotFoundException <<Exception>> {

}

class DataIncorrectException <<Exception>> {

}

SensorsService --> Sensor
SensorsService ..> SensorSchema
SensorsService ..> NotFoundException : Gra lub pokój, do którego chcemy dodać czujnik\nnie istnieje lub twórca nie ma dostępu
SensorsService ..> DataIncorrectException : Niepoprawne dane
SensorsService ..> SaveFailedException : Zapisanie danych nie powiodło się

@enduml
```

</div>

![](rendered/sensor-definition.svg)
