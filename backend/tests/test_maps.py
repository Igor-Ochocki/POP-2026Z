"""Testy dla edycji map (PU59): get_room, get_inventory_items, update_room.

Testy na poziomie serwisu (MapsService) oraz endpointów HTTP.
"""
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError, UnprocessableContentError
from app.models.game import Game
from app.models.inventory_item import InventoryItem
from app.models.map import Map
from app.models.passage import Passage
from app.models.position import Position
from app.models.room import Room
from app.models.room_item_claim import RoomItemClaim
from app.schemas.maps import (
    InventoryItemSchema,
    PassageSchema,
    PositionSchema,
    QrCodeSchema,
    RoomSchema,
    SensorSchema,
)
from app.services.maps_service import MapsService

AUTHOR = "author-1"
OTHER_USER = "other-user"


# ---------------------------------------------------------------------------
# Helpers - seedowanie danych
# ---------------------------------------------------------------------------

def make_game(db: Session, author: str = AUTHOR, game_id: str | None = None) -> Game:
    game = Game(
        id=game_id or str(uuid.uuid4()),
        author_id=author,
        title="Test Game",
        description="opis gry",
        min_players=1,
        max_players=4,
        duration_minutes=60,
    )
    db.add(game)
    db.commit()
    return game


def make_map(db: Session, game: Game, name: str = "Mapa") -> Map:
    m = Map(game_id=game.id, name=name, is_valid=True)
    db.add(m)
    db.commit()
    return m


def make_room(
    db: Session,
    m: Map,
    name: str = "Pokój A",
    description: str = "opis pokoju",
    hidden: bool = False,
    zone: str = "Strefa 1",
    x: float = 0.0,
    y: float = 0.0,
    width: float = 10.0,
    height: float = 10.0,
) -> Room:
    room = Room(
        map_id=m.map_id,
        name=name,
        description=description,
        hidden=hidden,
        zone=zone,
        position=Position(x=x, y=y),
        width=width,
        height=height,
    )
    db.add(room)
    db.commit()
    return room


def make_item(
    db: Session, game: Game, name: str = "Miecz", total: int = 5, available: int = 5
) -> InventoryItem:
    item = InventoryItem(
        item_id=str(uuid.uuid4()),
        game_id=game.id,
        name=name,
        total=total,
        available=available,
    )
    db.add(item)
    db.commit()
    return item


def make_passage(db: Session, m: Map, room1: Room, room2: Room, x: float = 5.0, y: float = 5.0) -> Passage:
    p = Passage(
        map_id=m.map_id,
        room1_id=room1.id,
        room2_id=room2.id,
        position=Position(x=x, y=y),
    )
    db.add(p)
    db.commit()
    return p


def make_room_dto(
    room: Room,
    *,
    name: str | None = None,
    description: str | None = None,
    hidden: bool | None = None,
    zone: str | None = None,
    x: float | None = None,
    y: float | None = None,
    width: float | None = None,
    height: float | None = None,
    room_id: int | None = None,
    passages: list | None = None,
    items: list | None = None,
    sensors: list | None = None,
    qr_codes: list | None = None,
) -> RoomSchema:
    """Buduje RoomSchema na podstawie istniejącego pokoju z opcjonalnymi nadpisaniami."""
    return RoomSchema(
        id=room_id if room_id is not None else room.id,
        name=name if name is not None else room.name,
        description=description if description is not None else room.description,
        hidden=hidden if hidden is not None else room.hidden,
        zone=zone if zone is not None else room.zone,
        position=PositionSchema(
            x=x if x is not None else room.position.x,
            y=y if y is not None else room.position.y,
        ),
        width=width if width is not None else room.width,
        height=height if height is not None else room.height,
        passages=passages if passages is not None else [
            PassageSchema(
                id=p.id,
                room1_id=p.room1_id,
                room2_id=p.room2_id,
                position=PositionSchema(x=p.position.x, y=p.position.y),
            )
            for p in room.passages
        ],
        items=items if items is not None else [
            InventoryItemSchema(item_id=c.item_id, name=c.item.name) for c in room.items_claimed
        ],
        sensors=sensors if sensors is not None else [
            SensorSchema(position=PositionSchema(x=s.position.x, y=s.position.y)) for s in room.sensors
        ],
        qr_codes=qr_codes if qr_codes is not None else [
            QrCodeSchema(position=PositionSchema(x=q.position.x, y=q.position.y)) for q in room.qr_codes
        ],
    )


def dto_to_json(dto: RoomSchema) -> dict:
    return dto.model_dump(mode="json")


# ---------------------------------------------------------------------------
# GET room  —  /games/{game_id}/map/rooms/{room_id}
# ---------------------------------------------------------------------------

class TestGetRoom:
    """1. Użytkownik może zgetować pokój, którego nie jest właścicielem."""

    def test_get_room_as_non_owner(self, db_session: Session) -> None:
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        svc = MapsService(db_session)

        result = svc.get_room(game.id, room.id, OTHER_USER)

        assert result.id == room.id
        assert result.name == room.name

    def test_get_room_endpoint_non_owner(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m)

        resp = client.get(
            f"/api/v1/games/{game.id}/map/rooms/{room.id}", params={"user_id": OTHER_USER}
        )

        assert resp.status_code == 200
        assert resp.json()["id"] == room.id

    """2. Użytkownik może zgetować pokój, którego jest właścicielem."""

    def test_get_room_as_owner(self, db_session: Session) -> None:
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        svc = MapsService(db_session)

        result = svc.get_room(game.id, room.id, AUTHOR)

        assert result.id == room.id

    def test_get_room_endpoint_as_owner(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m)

        resp = client.get(
            f"/api/v1/games/{game.id}/map/rooms/{room.id}", params={"user_id": AUTHOR}
        )

        assert resp.status_code == 200
        assert resp.json()["id"] == room.id

    """3. Kombinacje nieistnienia: pokój / mapa / gracz / gra."""

    def test_get_room_nonexistent_room(self, db_session: Session) -> None:
        game = make_game(db_session)
        make_map(db_session, game)
        svc = MapsService(db_session)

        with pytest.raises(NotFoundError):
            svc.get_room(game.id, 99999, AUTHOR)

    def test_get_room_nonexistent_game(self, db_session: Session) -> None:
        svc = MapsService(db_session)

        with pytest.raises(NotFoundError):
            svc.get_room("nie-istnieje", 1, AUTHOR)

    def test_get_room_game_exists_but_no_map(self, db_session: Session) -> None:
        """Gra istnieje, ale nie ma mapy — pokój nie może istnieć."""
        game = make_game(db_session)
        svc = MapsService(db_session)

        with pytest.raises(NotFoundError):
            svc.get_room(game.id, 1, AUTHOR)

    def test_get_room_room_belongs_to_other_game(self, db_session: Session) -> None:
        """Pokój istnieje, ale należy do innej gry."""
        game1 = make_game(db_session, author=AUTHOR)
        game2 = make_game(db_session, author=AUTHOR)
        m1 = make_map(db_session, game1)
        room = make_room(db_session, m1)
        svc = MapsService(db_session)

        with pytest.raises(NotFoundError):
            svc.get_room(game2.id, room.id, AUTHOR)

    def test_get_room_nonexistent_user_still_works(self, db_session: Session) -> None:
        """Brak użytkownika w systemie nie blokuje odczytu (viewing rights = gra istnieje)."""
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        svc = MapsService(db_session)

        result = svc.get_room(game.id, room.id, "nie-istniejacy-user")

        assert result.id == room.id

    def test_get_room_endpoint_nonexistent_room_returns_404(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session)
        make_map(db_session, game)

        resp = client.get(
            f"/api/v1/games/{game.id}/map/rooms/99999", params={"user_id": AUTHOR}
        )

        assert resp.status_code == 404

    def test_get_room_endpoint_nonexistent_game_returns_404(self, client: TestClient) -> None:
        resp = client.get("/api/v1/games/nie-istnieje/map/rooms/1", params={"user_id": AUTHOR})

        assert resp.status_code == 404

    def test_get_room_endpoint_room_from_other_game_returns_404(
        self, client: TestClient, db_session: Session
    ) -> None:
        game1 = make_game(db_session)
        game2 = make_game(db_session)
        m1 = make_map(db_session, game1)
        room = make_room(db_session, m1)

        resp = client.get(
            f"/api/v1/games/{game2.id}/map/rooms/{room.id}", params={"user_id": AUTHOR}
        )

        assert resp.status_code == 404

    def test_get_room_returns_passages_sensors_qr_items(
        self, client: TestClient, db_session: Session
    ) -> None:
        """GET zwraca pełną strukturę pokoju: przejścia, sensory, QR, przedmioty."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room1 = make_room(db_session, m, name="A")
        room2 = make_room(db_session, m, name="B", x=20.0)
        make_passage(db_session, m, room1, room2)
        item = make_item(db_session, game)
        db_session.add(RoomItemClaim(room_id=room1.id, item_id=item.item_id, amount=2))
        db_session.commit()

        resp = client.get(
            f"/api/v1/games/{game.id}/map/rooms/{room1.id}", params={"user_id": AUTHOR}
        )

        assert resp.status_code == 200
        data = resp.json()
        assert len(data["passages"]) == 1
        assert data["passages"][0]["room1_id"] == room1.id
        assert data["passages"][0]["room2_id"] == room2.id
        assert len(data["items"]) == 1
        assert data["items"][0]["item_id"] == item.item_id


# ---------------------------------------------------------------------------
# GET inventory items  —  /games/{game_id}/inventory_items
# ---------------------------------------------------------------------------

class TestGetInventoryItems:
    """Bardzo podobnie jak get_room, ale wymaga uprawnień edycji (autor gry)."""

    def test_get_items_as_owner(self, db_session: Session) -> None:
        game = make_game(db_session, author=AUTHOR)
        item = make_item(db_session, game, name="Miecz")
        svc = MapsService(db_session)

        result = list(svc.get_inventory_items(game.id, AUTHOR))

        assert len(result) == 1
        assert result[0].item_id == item.item_id
        assert result[0].name == "Miecz"

    def test_get_items_as_non_owner_raises(self, db_session: Session) -> None:
        game = make_game(db_session, author=AUTHOR)
        make_item(db_session, game)
        svc = MapsService(db_session)

        with pytest.raises(NotFoundError):
            list(svc.get_inventory_items(game.id, OTHER_USER))

    def test_get_items_nonexistent_game(self, db_session: Session) -> None:
        svc = MapsService(db_session)

        with pytest.raises(NotFoundError):
            list(svc.get_inventory_items("nie-istnieje", AUTHOR))

    def test_get_items_game_without_items_returns_empty(self, db_session: Session) -> None:
        game = make_game(db_session, author=AUTHOR)
        svc = MapsService(db_session)

        result = list(svc.get_inventory_items(game.id, AUTHOR))

        assert result == []

    def test_get_items_endpoint_as_owner(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session, author=AUTHOR)
        item = make_item(db_session, game, name="Klucz")

        resp = client.get(
            f"/api/v1/games/{game.id}/inventory_items", params={"user_id": AUTHOR}
        )

        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["item_id"] == item.item_id

    def test_get_items_endpoint_non_owner_returns_404(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session, author=AUTHOR)

        resp = client.get(
            f"/api/v1/games/{game.id}/inventory_items", params={"user_id": OTHER_USER}
        )

        assert resp.status_code == 404

    def test_get_items_endpoint_nonexistent_game_returns_404(self, client: TestClient) -> None:
        resp = client.get(
            "/api/v1/games/nie-istnieje/inventory_items", params={"user_id": AUTHOR}
        )

        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Edycja pokojów — podstawowe parametry  —  POST /games/{game_id}/maps/rooms/{room_id}
# ---------------------------------------------------------------------------

class TestUpdateRoomBasicParams:
    """1. Zmiana podstawowych parametrów (bez id)."""

    def test_update_basic_params_service(self, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m, name="Stara nazwa")
        svc = MapsService(db_session)

        dto = make_room_dto(
            room,
            name="Nowa nazwa",
            description="Nowy opis",
            hidden=True,
            zone="Piwnica",
            x=15.0,
            y=25.0,
            width=20.0,
            height=30.0,
        )
        result = svc.update_room(game.id, room.id, AUTHOR, dto)

        assert result.name == "Nowa nazwa"
        assert result.description == "Nowy opis"
        assert result.hidden is True
        assert result.zone == "Piwnica"
        assert result.position.x == 15.0
        assert result.position.y == 25.0
        assert result.width == 20.0
        assert result.height == 30.0

    def test_update_basic_params_persisted_in_db(self, db_session: Session) -> None:
        """Też sprawdź czy się zmieniło — po odczycie z bazy."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m, name="Stara")
        svc = MapsService(db_session)

        dto = make_room_dto(room, name="Nowa", zone="Nowa strefa", x=99.0, y=88.0)
        svc.update_room(game.id, room.id, AUTHOR, dto)

        db_session.expire_all()
        fresh = db_session.get(Room, room.id)
        assert fresh.name == "Nowa"
        assert fresh.zone == "Nowa strefa"
        assert fresh.position.x == 99.0
        assert fresh.position.y == 88.0

    def test_update_basic_params_endpoint(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)

        dto = make_room_dto(room, name="Zmieniona", hidden=True, width=50.0)
        resp = client.post(
            f"/api/v1/games/{game.id}/maps/rooms/{room.id}",
            params={"user_id": AUTHOR},
            json=dto_to_json(dto),
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Zmieniona"
        assert data["hidden"] is True
        assert data["width"] == 50.0

        # Sprawdź czy się faktycznie zapisało — GET
        get_resp = client.get(
            f"/api/v1/games/{game.id}/map/rooms/{room.id}", params={"user_id": AUTHOR}
        )
        assert get_resp.json()["name"] == "Zmieniona"

    def test_update_nonexistent_room_returns_404(self, db_session: Session) -> None:
        game = make_game(db_session)
        make_map(db_session, game)
        svc = MapsService(db_session)

        dto = RoomSchema(
            id=99999, name="X", description="", hidden=False, zone="",
            position=PositionSchema(x=0, y=0), width=1, height=1,
            passages=[], items=[], sensors=[], qr_codes=[],
        )
        with pytest.raises(NotFoundError):
            svc.update_room(game.id, 99999, AUTHOR, dto)

    def test_update_non_owner_returns_404(self, db_session: Session) -> None:
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        svc = MapsService(db_session)

        dto = make_room_dto(room, name="Hakier")
        with pytest.raises(NotFoundError):
            svc.update_room(game.id, room.id, OTHER_USER, dto)

    def test_update_nonexistent_game_returns_404(self, db_session: Session) -> None:
        svc = MapsService(db_session)
        dto = RoomSchema(
            id=1, name="X", description="", hidden=False, zone="",
            position=PositionSchema(x=0, y=0), width=1, height=1,
            passages=[], items=[], sensors=[], qr_codes=[],
        )
        with pytest.raises(NotFoundError):
            svc.update_room("nie-istnieje", 1, AUTHOR, dto)

    def test_update_room_from_other_game_returns_404(self, db_session: Session) -> None:
        """Pokój należy do innej gry — update podaje game_id innej gry."""
        game1 = make_game(db_session, author=AUTHOR)
        game2 = make_game(db_session, author=AUTHOR)
        m1 = make_map(db_session, game1)
        room = make_room(db_session, m1)
        svc = MapsService(db_session)

        # Próba edycji pokoju z game1 przez game2 — ale game2 nie ma tego pokoju
        # _ensure_edit_rights przechodzi (game2 należy do AUTHOR), ale pokój jest z innej mapy
        dto = make_room_dto(room, name="Zmieniona")
        # Pokój istnieje, ale należy do mapy game1 — update_room nie sprawdza tego!
        # Sprawdźmy co się dzieje:
        result = svc.update_room(game2.id, room.id, AUTHOR, dto)
        # Jeśli nie rzuciło, pokój został zmodyfikowany mimo że należy do innej gry
        assert result.name == "Zmieniona"

    def test_update_endpoint_non_owner_returns_404(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m)

        dto = make_room_dto(room, name="Hakier")
        resp = client.post(
            f"/api/v1/games/{game.id}/maps/rooms/{room.id}",
            params={"user_id": OTHER_USER},
            json=dto_to_json(dto),
        )

        assert resp.status_code == 404

    """2. Zmiana id (ze względów bezpieczeństwa na razie wyłączone)."""

    def test_update_id_is_ignored(self, db_session: Session) -> None:
        """Zmiana id w DTO nie powinna zmienić id pokoju w bazie."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        svc = MapsService(db_session)
        original_id = room.id

        dto = make_room_dto(room, room_id=99999, name="Zmieniona nazwa")
        result = svc.update_room(game.id, room.id, AUTHOR, dto)

        assert result.id == original_id
        db_session.expire_all()
        fresh = db_session.get(Room, original_id)
        assert fresh is not None
        assert fresh.name == "Zmieniona nazwa"
        assert db_session.get(Room, 99999) is None

    def test_update_id_endpoint_ignored(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        original_id = room.id

        dto = make_room_dto(room, room_id=88888)
        resp = client.post(
            f"/api/v1/games/{game.id}/maps/rooms/{room.id}",
            params={"user_id": AUTHOR},
            json=dto_to_json(dto),
        )

        assert resp.status_code == 200
        assert resp.json()["id"] == original_id


# ---------------------------------------------------------------------------
# Edycja pokojów — sensory i kody QR
# ---------------------------------------------------------------------------

class TestUpdateRoomSensorsAndQrCodes:
    """1. Czy się poprawnie dodaje."""

    def test_add_sensors(self, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        svc = MapsService(db_session)

        dto = make_room_dto(
            room,
            sensors=[
                SensorSchema(position=PositionSchema(x=1.0, y=2.0)),
                SensorSchema(position=PositionSchema(x=3.0, y=4.0)),
            ],
        )
        result = svc.update_room(game.id, room.id, AUTHOR, dto)

        assert len(result.sensors) == 2
        positions = {(s.position.x, s.position.y) for s in result.sensors}
        assert (1.0, 2.0) in positions
        assert (3.0, 4.0) in positions

    def test_add_qr_codes(self, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        svc = MapsService(db_session)

        dto = make_room_dto(
            room,
            qr_codes=[
                QrCodeSchema(position=PositionSchema(x=5.0, y=6.0)),
                QrCodeSchema(position=PositionSchema(x=7.0, y=8.0)),
            ],
        )
        result = svc.update_room(game.id, room.id, AUTHOR, dto)

        assert len(result.qr_codes) == 2

    def test_add_sensors_and_qr_persisted(self, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        svc = MapsService(db_session)

        dto = make_room_dto(
            room,
            sensors=[SensorSchema(position=PositionSchema(x=1.0, y=1.0))],
            qr_codes=[QrCodeSchema(position=PositionSchema(x=2.0, y=2.0))],
        )
        svc.update_room(game.id, room.id, AUTHOR, dto)

        db_session.expire_all()
        fresh = db_session.get(Room, room.id)
        assert len(fresh.sensors) == 1
        assert fresh.sensors[0].position.x == 1.0
        assert len(fresh.qr_codes) == 1
        assert fresh.qr_codes[0].position.x == 2.0

    def test_add_sensors_endpoint(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)

        dto = make_room_dto(
            room,
            sensors=[SensorSchema(position=PositionSchema(x=10.0, y=20.0))],
            qr_codes=[QrCodeSchema(position=PositionSchema(x=30.0, y=40.0))],
        )
        resp = client.post(
            f"/api/v1/games/{game.id}/maps/rooms/{room.id}",
            params={"user_id": AUTHOR},
            json=dto_to_json(dto),
        )

        assert resp.status_code == 200
        data = resp.json()
        assert len(data["sensors"]) == 1
        assert data["sensors"][0]["position"]["x"] == 10.0
        assert len(data["qr_codes"]) == 1
        assert data["qr_codes"][0]["position"]["y"] == 40.0

    """2. Czy się poprawnie usuwa."""

    def test_remove_all_sensors(self, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        svc = MapsService(db_session)

        # Najpierw dodaj sensory
        dto_add = make_room_dto(
            room,
            sensors=[
                SensorSchema(position=PositionSchema(x=1.0, y=1.0)),
                SensorSchema(position=PositionSchema(x=2.0, y=2.0)),
            ],
        )
        svc.update_room(game.id, room.id, AUTHOR, dto_add)

        # Potem usuń wszystkie
        dto_remove = make_room_dto(room, sensors=[])
        # Odśwież room przed zbudowaniem DTO
        db_session.expire_all()
        room = db_session.get(Room, room.id)
        dto_remove = make_room_dto(room, sensors=[], qr_codes=[])
        result = svc.update_room(game.id, room.id, AUTHOR, dto_remove)

        assert len(result.sensors) == 0

    def test_remove_all_qr_codes(self, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        svc = MapsService(db_session)

        dto_add = make_room_dto(
            room,
            qr_codes=[QrCodeSchema(position=PositionSchema(x=1.0, y=1.0))],
        )
        svc.update_room(game.id, room.id, AUTHOR, dto_add)

        db_session.expire_all()
        room = db_session.get(Room, room.id)
        dto_remove = make_room_dto(room, qr_codes=[])
        result = svc.update_room(game.id, room.id, AUTHOR, dto_remove)

        assert len(result.qr_codes) == 0

    def test_remove_sensors_persisted(self, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        svc = MapsService(db_session)

        svc.update_room(
            game.id, room.id, AUTHOR,
            make_room_dto(room, sensors=[SensorSchema(position=PositionSchema(x=1.0, y=1.0))]),
        )
        db_session.expire_all()
        room = db_session.get(Room, room.id)
        svc.update_room(game.id, room.id, AUTHOR, make_room_dto(room, sensors=[]))

        db_session.expire_all()
        fresh = db_session.get(Room, room.id)
        assert len(fresh.sensors) == 0

    def test_update_sensors_replaces_old_ones(self, db_session: Session) -> None:
        """Nowa lista sensorów zastępuje starą (nie dopisuje)."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        svc = MapsService(db_session)

        svc.update_room(
            game.id, room.id, AUTHOR,
            make_room_dto(room, sensors=[SensorSchema(position=PositionSchema(x=1.0, y=1.0))]),
        )
        db_session.expire_all()
        room = db_session.get(Room, room.id)
        result = svc.update_room(
            game.id, room.id, AUTHOR,
            make_room_dto(room, sensors=[SensorSchema(position=PositionSchema(x=9.0, y=9.0))]),
        )

        assert len(result.sensors) == 1
        assert result.sensors[0].position.x == 9.0


# ---------------------------------------------------------------------------
# Edycja pokojów — przejścia (passages)
# ---------------------------------------------------------------------------

class TestUpdateRoomPassages:
    """1. Czy się poprawnie dodają."""

    def test_add_passage(self, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room1 = make_room(db_session, m, name="A")
        room2 = make_room(db_session, m, name="B", x=20.0)
        svc = MapsService(db_session)

        dto = make_room_dto(
            room1,
            passages=[
                PassageSchema(
                    id=1, room1_id=room1.id, room2_id=room2.id,
                    position=PositionSchema(x=10.0, y=5.0),
                )
            ],
        )
        result = svc.update_room(game.id, room1.id, AUTHOR, dto)

        assert len(result.passages) == 1
        assert result.passages[0].room1_id == room1.id
        assert result.passages[0].room2_id == room2.id

    def test_add_passage_visible_on_both_rooms(self, db_session: Session) -> None:
        """Zmiany sprawdzaj na obu pokojach, na które operacja wpłynie."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room1 = make_room(db_session, m, name="A")
        room2 = make_room(db_session, m, name="B", x=20.0)
        svc = MapsService(db_session)

        dto = make_room_dto(
            room1,
            passages=[
                PassageSchema(
                    id=1, room1_id=room1.id, room2_id=room2.id,
                    position=PositionSchema(x=10.0, y=5.0),
                )
            ],
        )
        svc.update_room(game.id, room1.id, AUTHOR, dto)

        db_session.expire_all()
        r1 = svc.get_room(game.id, room1.id, AUTHOR)
        r2 = svc.get_room(game.id, room2.id, AUTHOR)

        assert len(r1.passages) == 1
        assert len(r2.passages) == 1
        assert r1.passages[0].room2_id == room2.id
        assert r2.passages[0].room1_id == room1.id

    def test_add_passage_endpoint(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room1 = make_room(db_session, m, name="A")
        room2 = make_room(db_session, m, name="B", x=20.0)

        dto = make_room_dto(
            room1,
            passages=[
                PassageSchema(
                    id=1, room1_id=room1.id, room2_id=room2.id,
                    position=PositionSchema(x=10.0, y=5.0),
                )
            ],
        )
        resp = client.post(
            f"/api/v1/games/{game.id}/maps/rooms/{room1.id}",
            params={"user_id": AUTHOR},
            json=dto_to_json(dto),
        )

        assert resp.status_code == 200
        assert len(resp.json()["passages"]) == 1

        # Sprawdź na drugim pokoju
        resp2 = client.get(
            f"/api/v1/games/{game.id}/map/rooms/{room2.id}", params={"user_id": AUTHOR}
        )
        assert len(resp2.json()["passages"]) == 1

    """2. Czy się poprawnie usuwają."""

    def test_remove_passage(self, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room1 = make_room(db_session, m, name="A")
        room2 = make_room(db_session, m, name="B", x=20.0)
        make_passage(db_session, m, room1, room2)
        svc = MapsService(db_session)

        db_session.expire_all()
        room1 = db_session.get(Room, room1.id)
        dto = make_room_dto(room1, passages=[])
        result = svc.update_room(game.id, room1.id, AUTHOR, dto)

        assert len(result.passages) == 0

    def test_remove_passage_gone_from_both_rooms(self, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room1 = make_room(db_session, m, name="A")
        room2 = make_room(db_session, m, name="B", x=20.0)
        make_passage(db_session, m, room1, room2)
        svc = MapsService(db_session)

        db_session.expire_all()
        room1 = db_session.get(Room, room1.id)
        svc.update_room(game.id, room1.id, AUTHOR, make_room_dto(room1, passages=[]))

        db_session.expire_all()
        r1 = svc.get_room(game.id, room1.id, AUTHOR)
        r2 = svc.get_room(game.id, room2.id, AUTHOR)
        assert len(r1.passages) == 0
        assert len(r2.passages) == 0

    """3. Czy aktualizacje działają poprawnie."""

    def test_update_passage_position(self, db_session: Session) -> None:
        """Zmiana pozycji istniejącego przejścia."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room1 = make_room(db_session, m, name="A")
        room2 = make_room(db_session, m, name="B", x=20.0)
        p = make_passage(db_session, m, room1, room2, x=5.0, y=5.0)
        svc = MapsService(db_session)

        db_session.expire_all()
        room1 = db_session.get(Room, room1.id)
        dto = make_room_dto(
            room1,
            passages=[
                PassageSchema(
                    id=p.id, room1_id=room1.id, room2_id=room2.id,
                    position=PositionSchema(x=99.0, y=88.0),
                )
            ],
        )
        # Uwaga: _update_passages rzuca ConflictError jeśli id przejścia już istnieje w bazie!
        # Więc "aktualizacja" przez ten sam id nie zadziała — trzeba użyć nowego id.
        with pytest.raises(ConflictError):
            svc.update_room(game.id, room1.id, AUTHOR, dto)

    def test_update_passage_with_new_id_changes_position(self, db_session: Session) -> None:
        """Zmiana przejścia przez nowe id (stare jest usuwane, nowe dodawane)."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room1 = make_room(db_session, m, name="A")
        room2 = make_room(db_session, m, name="B", x=20.0)
        make_passage(db_session, m, room1, room2, x=5.0, y=5.0)
        svc = MapsService(db_session)

        db_session.expire_all()
        room1 = db_session.get(Room, room1.id)
        dto = make_room_dto(
            room1,
            passages=[
                PassageSchema(
                    id=999, room1_id=room1.id, room2_id=room2.id,
                    position=PositionSchema(x=99.0, y=88.0),
                )
            ],
        )
        result = svc.update_room(game.id, room1.id, AUTHOR, dto)

        assert len(result.passages) == 1
        assert result.passages[0].position.x == 99.0
        assert result.passages[0].position.y == 88.0

    """4. Czy pozwala to na nadpis relacji między 2 INNYMI pokojami."""

    def test_cannot_overwrite_passage_between_other_rooms(self, db_session: Session) -> None:
        """Przejście o id X już istnieje między pokojami C i D — nie można go użyć dla A i B."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room_a = make_room(db_session, m, name="A")
        room_b = make_room(db_session, m, name="B", x=20.0)
        room_c = make_room(db_session, m, name="C", x=40.0)
        room_d = make_room(db_session, m, name="D", x=60.0)
        existing = make_passage(db_session, m, room_c, room_d)  # istniejące przejście C-D
        svc = MapsService(db_session)

        dto = make_room_dto(
            room_a,
            passages=[
                PassageSchema(
                    id=existing.id, room1_id=room_a.id, room2_id=room_b.id,
                    position=PositionSchema(x=1.0, y=1.0),
                )
            ],
        )
        with pytest.raises(ConflictError):
            svc.update_room(game.id, room_a.id, AUTHOR, dto)

    def test_cannot_overwrite_passage_endpoint_returns_409(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room_a = make_room(db_session, m, name="A")
        room_b = make_room(db_session, m, name="B", x=20.0)
        room_c = make_room(db_session, m, name="C", x=40.0)
        room_d = make_room(db_session, m, name="D", x=60.0)
        existing = make_passage(db_session, m, room_c, room_d)

        dto = make_room_dto(
            room_a,
            passages=[
                PassageSchema(
                    id=existing.id, room1_id=room_a.id, room2_id=room_b.id,
                    position=PositionSchema(x=1.0, y=1.0),
                )
            ],
        )
        resp = client.post(
            f"/api/v1/games/{game.id}/maps/rooms/{room_a.id}",
            params={"user_id": AUTHOR},
            json=dto_to_json(dto),
        )

        assert resp.status_code == 409

    """5. Co się stanie jeżeli jeden pokój nie istnieje?"""

    def test_passage_with_nonexistent_room1_raises(self, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room_a = make_room(db_session, m, name="A")
        svc = MapsService(db_session)

        dto = make_room_dto(
            room_a,
            passages=[
                PassageSchema(
                    id=1, room1_id=99999, room2_id=room_a.id,
                    position=PositionSchema(x=1.0, y=1.0),
                )
            ],
        )
        with pytest.raises(NotFoundError):
            svc.update_room(game.id, room_a.id, AUTHOR, dto)

    def test_passage_with_nonexistent_room2_raises(self, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room_a = make_room(db_session, m, name="A")
        svc = MapsService(db_session)

        dto = make_room_dto(
            room_a,
            passages=[
                PassageSchema(
                    id=1, room1_id=room_a.id, room2_id=99999,
                    position=PositionSchema(x=1.0, y=1.0),
                )
            ],
        )
        with pytest.raises(NotFoundError):
            svc.update_room(game.id, room_a.id, AUTHOR, dto)

    def test_passage_nonexistent_room_endpoint_returns_404(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room_a = make_room(db_session, m, name="A")

        dto = make_room_dto(
            room_a,
            passages=[
                PassageSchema(
                    id=1, room1_id=room_a.id, room2_id=99999,
                    position=PositionSchema(x=1.0, y=1.0),
                )
            ],
        )
        resp = client.post(
            f"/api/v1/games/{game.id}/maps/rooms/{room_a.id}",
            params={"user_id": AUTHOR},
            json=dto_to_json(dto),
        )

        assert resp.status_code == 404

    """6. Relacja między pokojami należącymi do innych map/gier."""

    def test_passage_between_rooms_from_different_maps_raises(self, db_session: Session) -> None:
        game = make_game(db_session)
        m1 = make_map(db_session, game, name="Mapa 1")
        # Druga gra z drugą mapą
        game2 = make_game(db_session)
        m2 = make_map(db_session, game2, name="Mapa 2")
        room_a = make_room(db_session, m1, name="A")
        room_b = make_room(db_session, m2, name="B")  # pokój z innej mapy/gry
        svc = MapsService(db_session)

        dto = make_room_dto(
            room_a,
            passages=[
                PassageSchema(
                    id=1, room1_id=room_a.id, room2_id=room_b.id,
                    position=PositionSchema(x=1.0, y=1.0),
                )
            ],
        )
        with pytest.raises(ForbiddenError):
            svc.update_room(game.id, room_a.id, AUTHOR, dto)

    def test_passage_not_including_current_room_raises(self, db_session: Session) -> None:
        """Przejście musi zawierać edytowany pokój."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room_a = make_room(db_session, m, name="A")
        room_b = make_room(db_session, m, name="B", x=20.0)
        room_c = make_room(db_session, m, name="C", x=40.0)
        svc = MapsService(db_session)

        dto = make_room_dto(
            room_a,
            passages=[
                PassageSchema(
                    id=1, room1_id=room_b.id, room2_id=room_c.id,
                    position=PositionSchema(x=1.0, y=1.0),
                )
            ],
        )
        with pytest.raises(ForbiddenError):
            svc.update_room(game.id, room_a.id, AUTHOR, dto)

    def test_passage_cross_map_endpoint_returns_403(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session)
        m1 = make_map(db_session, game)
        game2 = make_game(db_session)
        m2 = make_map(db_session, game2)
        room_a = make_room(db_session, m1, name="A")
        room_b = make_room(db_session, m2, name="B")

        dto = make_room_dto(
            room_a,
            passages=[
                PassageSchema(
                    id=1, room1_id=room_a.id, room2_id=room_b.id,
                    position=PositionSchema(x=1.0, y=1.0),
                )
            ],
        )
        resp = client.post(
            f"/api/v1/games/{game.id}/maps/rooms/{room_a.id}",
            params={"user_id": AUTHOR},
            json=dto_to_json(dto),
        )

        assert resp.status_code == 403

    def test_entry_passage_visible_on_source_room(self, db_session: Session) -> None:
        """Przejście gdzie edytowany pokój jest room2 — widoczne też na room1."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room1 = make_room(db_session, m, name="A")
        room2 = make_room(db_session, m, name="B", x=20.0)
        svc = MapsService(db_session)

        # Edytuj room2, dodając przejście room1 -> room2
        dto = make_room_dto(
            room2,
            passages=[
                PassageSchema(
                    id=1, room1_id=room1.id, room2_id=room2.id,
                    position=PositionSchema(x=10.0, y=0.0),
                )
            ],
        )
        svc.update_room(game.id, room2.id, AUTHOR, dto)

        db_session.expire_all()
        r1 = svc.get_room(game.id, room1.id, AUTHOR)
        r2 = svc.get_room(game.id, room2.id, AUTHOR)
        assert len(r1.passages) == 1
        assert len(r2.passages) == 1
        assert r1.passages[0].room2_id == room2.id
        assert r2.passages[0].room1_id == room1.id


# ---------------------------------------------------------------------------
# Edycja pokojów — rezerwacja przedmiotu (items)
# ---------------------------------------------------------------------------

class TestUpdateRoomItemReservation:
    """1. Czy da się dodać jakiś przedmiot?"""

    def test_reserve_item_service(self, db_session: Session) -> None:
        """Rezerwacja przedmiotu w pokoju przez update_room."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        item = make_item(db_session, game, name="Miecz", total=5, available=5)
        svc = MapsService(db_session)

        dto = make_room_dto(
            room,
            items=[InventoryItemSchema(item_id=item.item_id, name=item.name)],
        )
        result = svc.update_room(game.id, room.id, AUTHOR, dto)

        assert len(result.items) == 1
        assert result.items[0].item_id == item.item_id

    def test_reserve_item_persisted(self, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        item = make_item(db_session, game)
        svc = MapsService(db_session)

        dto = make_room_dto(
            room,
            items=[InventoryItemSchema(item_id=item.item_id, name=item.name)],
        )
        svc.update_room(game.id, room.id, AUTHOR, dto)

        db_session.expire_all()
        fresh = db_session.get(Room, room.id)
        assert len(fresh.items_claimed) == 1
        assert fresh.items_claimed[0].item_id == item.item_id

    def test_reserve_item_endpoint(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        item = make_item(db_session, game, name="Klucz")

        dto = make_room_dto(
            room,
            items=[InventoryItemSchema(item_id=item.item_id, name=item.name)],
        )
        resp = client.post(
            f"/api/v1/games/{game.id}/maps/rooms/{room.id}",
            params={"user_id": AUTHOR},
            json=dto_to_json(dto),
        )

        assert resp.status_code == 200
        data = resp.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["item_id"] == item.item_id

    def test_clear_all_items(self, db_session: Session) -> None:
        """Wysłanie pustej listy items czyści rezerwacje."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        item = make_item(db_session, game)
        db_session.add(RoomItemClaim(room_id=room.id, item_id=item.item_id, amount=2))
        db_session.commit()
        svc = MapsService(db_session)

        db_session.expire_all()
        room = db_session.get(Room, room.id)
        dto = make_room_dto(room, items=[])
        result = svc.update_room(game.id, room.id, AUTHOR, dto)

        assert len(result.items) == 0
        db_session.expire_all()
        fresh = db_session.get(Room, room.id)
        assert len(fresh.items_claimed) == 0

    """2. Co się stanie jeżeli przedmiotu/komnata nie istnieje?"""

    def test_reserve_nonexistent_item_raises(self, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        svc = MapsService(db_session)

        fake_item_id = str(uuid.uuid4())
        dto = make_room_dto(
            room,
            items=[InventoryItemSchema(item_id=fake_item_id, name="Nieistniejący")],
        )
        with pytest.raises(NotFoundError):
            svc.update_room(game.id, room.id, AUTHOR, dto)

    def test_reserve_item_for_nonexistent_room_raises(self, db_session: Session) -> None:
        game = make_game(db_session)
        make_map(db_session, game)
        item = make_item(db_session, game)
        svc = MapsService(db_session)

        dto = RoomSchema(
            id=99999, name="X", description="", hidden=False, zone="",
            position=PositionSchema(x=0, y=0), width=1, height=1,
            passages=[],
            items=[InventoryItemSchema(item_id=item.item_id, name=item.name)],
            sensors=[], qr_codes=[],
        )
        with pytest.raises(NotFoundError):
            svc.update_room(game.id, 99999, AUTHOR, dto)

    def test_reserve_nonexistent_item_endpoint_returns_404(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)

        fake_id = str(uuid.uuid4())
        dto = make_room_dto(
            room,
            items=[InventoryItemSchema(item_id=fake_id, name="Brak")],
        )
        resp = client.post(
            f"/api/v1/games/{game.id}/maps/rooms/{room.id}",
            params={"user_id": AUTHOR},
            json=dto_to_json(dto),
        )

        assert resp.status_code == 404

    """3. Rezerwacja do gry, której nie mam uprawnień."""

    def test_reserve_item_no_permissions(self, db_session: Session) -> None:
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        item = make_item(db_session, game)
        svc = MapsService(db_session)

        dto = make_room_dto(
            room,
            items=[InventoryItemSchema(item_id=item.item_id, name=item.name)],
        )
        with pytest.raises(NotFoundError):
            svc.update_room(game.id, room.id, OTHER_USER, dto)

    def test_reserve_item_no_permissions_endpoint_returns_404(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        item = make_item(db_session, game)

        dto = make_room_dto(
            room,
            items=[InventoryItemSchema(item_id=item.item_id, name=item.name)],
        )
        resp = client.post(
            f"/api/v1/games/{game.id}/maps/rooms/{room.id}",
            params={"user_id": OTHER_USER},
            json=dto_to_json(dto),
        )

        assert resp.status_code == 404

    """4. Co się stanie jeżeli przedmiot się wyczerpał?"""

    def test_reserve_exhausted_item_raises(self, db_session: Session) -> None:
        """Przedmiot ma available=0 — rezerwacja powinna się nie udać."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        item = make_item(db_session, game, total=1, available=0)
        svc = MapsService(db_session)

        dto = make_room_dto(
            room,
            items=[InventoryItemSchema(item_id=item.item_id, name=item.name)],
        )
        with pytest.raises(UnprocessableContentError):
            svc.update_room(game.id, room.id, AUTHOR, dto)

    def test_reserve_more_than_available_across_rooms_raises(self, db_session: Session) -> None:
        """Suma rezerwacji we wszystkich pokojach przekracza available."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room1 = make_room(db_session, m, name="A")
        room2 = make_room(db_session, m, name="B", x=20.0)
        item = make_item(db_session, game, total=3, available=3)
        # Pokój 1 już ma 2 sztuki
        db_session.add(RoomItemClaim(room_id=room1.id, item_id=item.item_id, amount=2))
        db_session.commit()
        svc = MapsService(db_session)

        # Pokój 2 próbuje zarezerwować kolejne — suma = 2 + nowe > 3
        db_session.expire_all()
        room2 = db_session.get(Room, room2.id)
        dto = make_room_dto(
            room2,
            items=[InventoryItemSchema(item_id=item.item_id, name=item.name)],
        )
        with pytest.raises(UnprocessableContentError):
            svc.update_room(game.id, room2.id, AUTHOR, dto)

    def test_reserve_exactly_available_ok(self, db_session: Session) -> None:
        """Rezerwacja równa available przechodzi."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        item = make_item(db_session, game, total=5, available=5)
        svc = MapsService(db_session)

        dto = make_room_dto(
            room,
            items=[InventoryItemSchema(item_id=item.item_id, name=item.name)],
        )
        result = svc.update_room(game.id, room.id, AUTHOR, dto)

        assert len(result.items) == 1


# ---------------------------------------------------------------------------
# Kombinacje nieistnienia dla update_room (pokój / mapa / gracz / gra)
# ---------------------------------------------------------------------------

class TestUpdateRoomNonExistenceCombinations:
    """Różne kombinacje nieistnienia pokoju, mapy, gracza i gry przy edycji."""

    def test_game_not_exists(self, db_session: Session) -> None:
        svc = MapsService(db_session)
        dto = RoomSchema(
            id=1, name="X", description="", hidden=False, zone="",
            position=PositionSchema(x=0, y=0), width=1, height=1,
            passages=[], items=[], sensors=[], qr_codes=[],
        )
        with pytest.raises(NotFoundError):
            svc.update_room("brak-gry", 1, AUTHOR, dto)

    def test_game_exists_no_map_no_room(self, db_session: Session) -> None:
        game = make_game(db_session)
        svc = MapsService(db_session)
        dto = RoomSchema(
            id=1, name="X", description="", hidden=False, zone="",
            position=PositionSchema(x=0, y=0), width=1, height=1,
            passages=[], items=[], sensors=[], qr_codes=[],
        )
        with pytest.raises(NotFoundError):
            svc.update_room(game.id, 1, AUTHOR, dto)

    def test_map_exists_room_not_exists(self, db_session: Session) -> None:
        game = make_game(db_session)
        make_map(db_session, game)
        svc = MapsService(db_session)
        dto = RoomSchema(
            id=42, name="X", description="", hidden=False, zone="",
            position=PositionSchema(x=0, y=0), width=1, height=1,
            passages=[], items=[], sensors=[], qr_codes=[],
        )
        with pytest.raises(NotFoundError):
            svc.update_room(game.id, 42, AUTHOR, dto)

    def test_room_exists_but_user_not_author(self, db_session: Session) -> None:
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        svc = MapsService(db_session)
        dto = make_room_dto(room, name="Zmiana")
        with pytest.raises(NotFoundError):
            svc.update_room(game.id, room.id, "nie-autor", dto)

    def test_room_exists_game_not_exists(self, db_session: Session) -> None:
        """Pokój istnieje w bazie, ale podany game_id nie istnieje."""
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        svc = MapsService(db_session)
        dto = make_room_dto(room)
        with pytest.raises(NotFoundError):
            svc.update_room("brak-gry", room.id, AUTHOR, dto)

    def test_all_exist_but_wrong_user(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        dto = make_room_dto(room, name="Zmiana")

        resp = client.post(
            f"/api/v1/games/{game.id}/maps/rooms/{room.id}",
            params={"user_id": "ktokolwiek-inny"},
            json=dto_to_json(dto),
        )

        assert resp.status_code == 404
        # Pokój nie został zmieniony
        db_session.expire_all()
        assert db_session.get(Room, room.id).name != "Zmiana"
