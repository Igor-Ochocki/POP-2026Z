```plantuml
interface IMapsApi <<interface>> \n<< /api/v1/games >> {
    + <<GET {game_id}/room/{room_id}>> get_room(game_id: str, room_id: str, user_id: str) : RoomDTO
    + <<PUT {game_id}/room/{room_id}>> update_room(game_id: str, room_id: str, user_id: str, data: RoomDTO) : RoomDTO
}

class MapsController implements IMapsApi {
    - room_service: IMapsService
}

interface IMapsService <<interface>> {
    + get_room(game_id: str, room_id: str, user_id: str) : RoomDTO
    + update_room(game_id: str, room_id: str, user_id: str, data: RoomDTO) : RoomDTO
}

MapsController --> IMapsService

class MapsService implements IMapsService {
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

class InventoryItem <<BaseModel>> {
    + id: str
    + name: str
    + total: number
    + available: number
}

class RoomDoor <<BaseModel>> {
    + id: str
    + source_room_position: Position
    + source_room_id: str
    + target_room_position: Position
    + target_room_id: str
    + is_unlocked: bool
}

class Sensor <<BaseModel>> {
    + id: str
    + position: Position
}

class QrCode <<BaseModel>> {
    + id: str
    + position: Position
    }

class RoomDoorDTO {
    + id: str
    + source_room_position: Position
    + target_room_position: Position
    + target_room_id: str
    + is_unlocked: bool
}

class RoomDTO {
    + name: str
    + description: str
    + hidden: bool
    + zone: str
    + items: InventoryItemDTO[]
    + sensors: SensorDTO[]
    + qrCodes: QrCodeDTO[]
    + doors: RoomDoorDTO[]
}


class SensorDTO {
    + position: Position
}

class QrCodeDTO {
    + position: Position
}

CLASS InventoryItemDTO {
    + id: str
    + name: str
}

class ItemUnavailableException <<Exception>> {

}

class NotFoundException <<Exception>> {

}

class ValidationException <<Exception>> {

}

class UpdateException <<Exception>> {

}

MapsService --> Room
MapsService ..> RoomDTO
MapsService ..> NotFoundException : Pokój, gra, bądź ekwipunek nie istnieją, lub brak dostępu
MapsService ..> ValidationException : Wprowadzone dane są niepoprawne
MapsService ..> UpdateException : Zapisanie danych w bazie danych zakończyło się błędem
MapsService ..> ItemUnavailableException : Jeden lub więcej dodawanych przedmiotów jest niedostępne

```