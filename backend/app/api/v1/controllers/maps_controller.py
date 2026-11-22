from abc import ABC, abstractmethod
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.maps import RoomSchema, InventoryItemSchema
from app.services.maps_service import IMapsService, MapsService


class IMapsApi(ABC):
    @abstractmethod
    def get_room(self, game_id: str, room_id: str, user_id: str,) -> RoomSchema: ...

    @abstractmethod
    def get_inventory_items(self, game_id: str) -> list[InventoryItemSchema]: ...

    @abstractmethod
    def update_room(self, game_id: str, room_id: str, user_id: str, dto: RoomSchema) -> RoomSchema: ...




router = APIRouter(prefix="/games", tags=["games", "maps", "editor"])


def get_maps_service(db: Annotated[Session, Depends(get_db)]) -> IMapsService:
    return MapsService(db)


@router.get("/{game_id}/map/rooms/{room_id}}", response_model=RoomSchema)
def get_room(
    game_id: str, 
    room_id: str,
    user_id: str, 
    service: Annotated[IMapsService, Depends(get_maps_service)],
) -> RoomSchema:
    return service.get_room(game_id, room_id, user_id)

@router.get("/{game_id}/inventory_items")
def get_inventory_items(
    game_id: str,
    user_id: str,
    service: Annotated[IMapsService, Depends(get_maps_service)]
) -> list[InventoryItemSchema]:
    return service.get_inventory_items()

@router.post("/{game_id}/maps/rooms/{room_id}")
def update_room(
    game_id: str,
    room_id: str,
    user_id: str,
    dto: RoomSchema,
    service: Annotated[IMapsService, Depends(get_maps_service)]

) -> RoomSchema:
    return service.update_room(game_id, room_id, user_id, dto)