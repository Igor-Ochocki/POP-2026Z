```plantuml
interface IRoomApi <<interface>> \n<< /api/v1/games >> {
    + <<GET {game_id}/room/{room_id}>> get_room(game_id: str, room_id: str, user_id: str) : RoomDTO
    + <<PUT {game_id}/room/{room_id}>> update_room(game_id: str, room_id: str, user_id: str, data: RoomDTO) : RoomDTO
}

class RoomController implements IRoomApi {
    - room_service: IRoomService
}

interface IRoomService <<interface>> {
    + get_room(game_id: str, room_id: str, user_id: str) : RoomDTO
    + update_room(game_id: str, room_id: str, user_id: str, data: RoomDTO) : RoomDTO
}

RoomController --> IRoomService

class RoomService implements IRoomService {
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

class Sensor <<BaseModel>> {
    + id: str
    + positionX: number
    + positionY: number
}

class QrCode <<BaseModel>> {
    + id: str
    + positionX: number
    + positionY: number
    + content: str
}


class RoomDTO {
    + name: str
    + description: str
    + hidden: bool
    + zone: str
    + items: InventoryItemDTO[]
    + sensors: SensorDTO[]
    + qrCodes: QrCodeDTO[]
}


class SensorDTO {
    + positionX: number
    + positionY: number
}

class QrCodeDTO {
    + positionX: number
    + positionY: number
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

RoomService --> Room
RoomService ..> RoomDTO
RoomService ..> NotFoundException : Pokój, gra, bądź ekwipunek nie istnieją, lub brak dostępu
RoomService ..> ValidationException : Wprowadzone dane są niepoprawne
RoomService ..> UpdateException : Zapisanie danych w bazie danych zakończyło się błędem
RoomService ..> ItemUnavailableException : Jeden lub więcej dodawnaych przedmiotów jest niedostępne

```