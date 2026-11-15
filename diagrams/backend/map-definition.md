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
    + id: int
    + name: str
    + description: str
    + rooms: RoomDTO[]
    + room_connections: RoomConnection[]
}

class MapDTO {
    + id: int
    + name: str
    + description: str
    + rooms: RoomDTO[]
    + room_connections: RoomConnection[]
}

class InventoryItem <<BaseModel>> {
    + id: int
    + name: str
    + total: number
    + available: number
}

class Room <<BaseModel>> {
    + id: int
    + name: str
    + description: str
    + hidden: bool
    + zone: str
    + items: InventoryItem[]
    + sensors: Sensor[]
    + qrCodes: QrCode[]
}

class Sensor <<BaseModel>> {
    + id: int
    + position: Position
}

class QrCode <<BaseModel>> {
    + id: int
    + position: Position
    + content: str
}

class RoomDTO {
    + id: int
    + name: str
    + description: str
    + hidden: bool
    + zone: str
    + items: InventoryItemDTO[]
    + sensors: SensorDTO[]
    + qrCodes: QrCodeDTO[]
}

class SensorDTO {
    + id: int
    + position: Position
}

class QrCodeDTO {
    + id: int
    + position: Position
}

class InventoryItemDTO {
    + id: int
    + name: str
}

class Position <<BaseModel>> {
    + x: number
    + y: number
}

class PositionDTO {
    + x: number
    + y: number
}

class Passage <<BaseModel>> {
    + id: int
    + room1Id: int
    + room2Id: int
}

class PassageDTO {
    + id: int
    + room1Id: int
    + room2Id: int
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
