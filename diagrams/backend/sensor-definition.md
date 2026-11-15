```plantuml
interface ISensorApi <<interface>> \n<< /api/v1/games >> {
    + <<PUT {game_id}/sensor/add>> add_sensor(game_id: str, room_id: str, positionX: str, positionY: str, data: SensorDTO) : SensorDTO
}

class SensorController implements ISensorApi {
    - sensor_service: ISensorService
}

interface ISensorService <<interface>> {
    + add_sensor(game_id: str, room_id: str, positionX: str, positionY: str) : SensorDTO
}

SensorController --> ISensorService

class SensorService implements ISensorService {
}

class Sensor <<BaseModel>> {
    + id: str
    + name: str
    + description: str
    + positionX: number
    + positionY: number
}

class SensorDTO {
    + name: str
    + description: str
    + positionX: number
    + positionY: number
}

class SaveFailedException <<Exception>> {

}

class NotFoundException <<Exception>> {

}

class DataIncorrectException <<Exception>> {

}

SensorService --> Sensor
SensorService ..> SensorDTO
SensorService ..> NotFoundException : Gra lub pokój, do którego chcemy dodać czujnik, nie istnieje
SensorService ..> DataIncorrectException : Niepoprawne dane
SensorService ..> SaveFailedException : Zapisanie danych nie powiodło się
```
