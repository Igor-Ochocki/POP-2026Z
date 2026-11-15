```plantuml
interface IMapApi <<interface>> \n<< /api/v1/games >> {
    + <<GET {game_id}/map/>> get_map(game_id: str, user_id: str) : MapDTO
    + <<POST {game_id}/map/edit>> edit_map(game_id: str, user_id: str, data: MapDTO) : MapDTO
}

class MapController implements IMapApi {
    - map_service: IMapService
}

interface IMapService <<interface>> {
    + get_map(game_id: str, user_id: str) : MapDTO
    + edit_map(game_id: str, user_id: str, data: MapDTO) : MapDTO
}

MapController --> IMapService

class MapService implements IMapService {
}

class Map <<BaseModel>> {
    + id: str
    + name: str
    + description: str
    + rooms: RoomDTO[]
    + room_connections: RoomConnection[]
}

class MapDTO {
    + id: str
    + name: str
    + description: str
    + rooms: RoomDTO[]
    + room_connections: RoomConnection[]
}

class InventoryItem <<BaseModel>> {
    + id: str
    + name: str
    + total: number
    + available: number
}

class Room <<BaseModel>> {
    + id: str
    + name: str
    + description: str
    + hidden: bool
    + zone: str
    + items: InventoryItem[]
    + sensors: Sensor[]
    + qrCodes: QrCode[]
}

class Sensor <<BaseModel>> {
    + id: str
    + position: Position
}

class QrCode <<BaseModel>> {
    + id: str
    + position: Position
    + content: str
}

class RoomDTO {
    + id: str
    + name: str
    + description: str
    + hidden: bool
    + zone: str
    + items: InventoryItemDTO[]
    + sensors: SensorDTO[]
    + qrCodes: QrCodeDTO[]
}

class SensorDTO {
    + id: str
    + position: Position
}

class QrCodeDTO {
    + id: str
    + position: Position
}

class InventoryItemDTO {
    + id: str
    + name: str
}

class Position {
    + X: number
    + Y: number
}

class RoomConnection {
    + room_ids: str[]
}

class NotFoundException <<Exception>> {

}

class DataIncorrectException <<Exception>> {

}

class SaveFailedException <<Exception>> {

}

MapService --> Map
MapService ..> MapDTO
MapService ..> NotFoundException : Gra nie istnieje lub twórca nie ma do niej dostępu
MapService ..> DataIncorrectException : Niepoprawne dane
MapService ..> SaveFailedException : Zapisanie danych nie powiodło się
```
