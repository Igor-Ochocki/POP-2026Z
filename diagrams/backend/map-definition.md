<div hidden>

```
@startuml map-definition
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU60 Definicja mapy gry - backend

interface IGamesApi <<interface>>\n<< /api/v1/games >> {
    + <<GET /{game_id}/map >>\n\tget_map(game_id: str, user_id: str): MapSchema
    + <<POST /{game_id}/map/edit >>\n\tedit_map(game_id: str, user_id: str, data: MapSchema): MapSchema
}

class GamesController <<Controller>> {
    - games_service: IGamesService
}

interface IGamesService <<interface>> {
    + get_map(game_id: str, user_id: str): MapSchema
    + edit_map(game_id: str, user_id: str, data: MapSchema): MapSchema
}

class GamesService <<Service>> {
    - db_session: Session
    - _ensure_unique_ids(ids: list[str | int], entity_name: str)
    - _ensure_ids_available(...)
    - _map_to_schema(map_model: Map): MapSchema
    - _position_to_schema(position: Position): PositionSchema
    - _position_from_schema(position: PositionSchema): Position
}

class Map <<Base>> {
    + map_id: str
    + game_id: str
    + name: str
    + description: str
    + is_valid: bool
    + container: {width, height} | None
}

class Room <<Base>> {
    + id: int
    + map_id: str
    + name: str
    + description: str
    + hidden: bool
    + zone: str
    + position: Position
    + width: float
    + height: float
}

class Passage <<Base>> {
    + id: int
    + map_id: str
    + room1_id: int
    + room2_id: int
    + position: Position
}

class Position <<composite>> {
    + x: float
    + y: float
}

class MapSchema <<BaseModel>> {
    + id: str
    + game_id: str
    + name: str
    + description: str
    + is_valid: bool
    + container: MapContainerSchema | None
    + rooms: list[RoomSchema]
    + passages: list[PassageSchema]
}

class MapContainerSchema <<BaseModel>> {
    + width: int
    + height: int
}

class RoomSchema <<BaseModel>> {
    + id: int
    + name: str
    + description: str
    + width: int
    + height: int
    + position: PositionSchema
    + hidden: bool
    + zone: str
    + items: list[InventoryItemSchema]
    + sensors: list[SensorSchema]
    + qrCodes: list[QRCodeSchema]
}

class PassageSchema <<BaseModel>> {
    + id: int
    + room1_id: int
    + room2_id: int
    + position: PositionSchema
}

class PositionSchema <<BaseModel>> {
    + x: float
    + y: float
}

class InventoryItemSchema <<BaseModel>> {
    + id: str
    + name: str
    + total: int
    + available: int
}

class SensorSchema <<BaseModel>>
class QRCodeSchema <<BaseModel>> {
    + id: str
    + position: PositionSchema
}

class NotFoundError <<Exception>>
class ConflictError <<Exception>>

GamesController .u.|> IGamesApi
GamesController --> IGamesService
GamesService .u.|> IGamesService
GamesService --> Map
GamesService ..> MapSchema
GamesService ..> NotFoundError : gra nie istnieje lub jest cudza,\nbrak mapy (get_map)
GamesService ..> ConflictError : powtórzone lub zajęte id,\nprzejście spoza mapy,\nid / game_id mapy niezgodne

Map *-- "*" Room
Map *-- "*" Passage
Passage "*" --> "2" Room : room1_id, room2_id
Room --> Position
Passage --> Position

MapSchema *-- "0..1" MapContainerSchema
MapSchema *-- "*" RoomSchema
MapSchema *-- "*" PassageSchema
RoomSchema *-- "*" InventoryItemSchema
RoomSchema *-- "*" SensorSchema
RoomSchema *-- "*" QRCodeSchema

note bottom of SensorSchema
    Pełna definicja - PU50 (sensor-definition.md).
end note
note right of GamesService
    Metody mapy są częścią IGamesApi / IGamesService
    (pozostałe metody - PU25, PU49).
    Zapis mapy zastępuje komnaty i przejścia mapy gry.
end note
@enduml
```

</div>

![](rendered/map-definition.svg)
