```plantuml
interface ISensorApi <<interface>> \n<< /api/v1/games >> {
    + <<GET sensortypes>> get_sensor_types() : str[]
    + <<PUT {game_id}/sensor/add>> add_sensor(game_id: str, user_id: str, room_id: str, data: SensorSchema) : SensorSchema
}

class SensorController implements ISensorApi {
    - sensor_service: ISensorService
}

interface ISensorService <<interface>> {
    + get_sensor_types() : str[]
    + add_sensor(game_id: str, user_id: str, room_id: str, data: SensorSchema) : SensorSchema
}

SensorController --> ISensorService

class SensorService implements ISensorService {
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

SensorService --> Sensor
SensorService ..> SensorSchema
SensorService ..> NotFoundException : Gra lub pokój, do którego chcemy dodać czujnik\nnie istnieje lub twórca nie ma dostępu
```
SensorService ..> DataIncorrectException : Niepoprawne dane
SensorService ..> SaveFailedException : Zapisanie danych nie powiodło się
