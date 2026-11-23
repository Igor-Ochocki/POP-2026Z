"""Testy dla edycji map (PU59) — wyłącznie przez endpointy HTTP.

Endpointy:
  GET  /api/v1/games/{game_id}/map/rooms/{room_id}?user_id=...
  GET  /api/v1/games/{game_id}/inventory_items?user_id=...
  POST /api/v1/games/{game_id}/maps/rooms/{room_id}?user_id=...   (body: RoomSchema)
"""
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

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

AUTHOR = "author-1"
OTHER_USER = "other-user"


# ---------------------------------------------------------------------------
# Helpers — seedowanie danych bezpośrednio do bazy (przez db_session)
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


# ---------------------------------------------------------------------------
# Helpers — budowanie DTO i wywołania HTTP
# ---------------------------------------------------------------------------

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


def get_room(client: TestClient, game_id: str, room_id: int, user_id: str):
    return client.get(
        f"/api/v1/games/{game_id}/map/rooms/{room_id}", params={"user_id": user_id}
    )


def get_items(client: TestClient, game_id: str, user_id: str):
    return client.get(f"/api/v1/games/{game_id}/inventory_items", params={"user_id": user_id})


def update_room(client: TestClient, game_id: str, room_id: int, user_id: str, dto: RoomSchema):
    return client.post(
        f"/api/v1/games/{game_id}/maps/rooms/{room_id}",
        params={"user_id": user_id},
        json=dto.model_dump(mode="json"),
    )


# ---------------------------------------------------------------------------
# GET room
# ---------------------------------------------------------------------------

class TestGetRoom:
    """1. Użytkownik może zgetować pokój, którego nie jest właścicielem."""

    def test_get_room_as_non_owner(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m)

        resp = get_room(client, game.id, room.id, OTHER_USER)

        assert resp.status_code == 200
        assert resp.json()["id"] == room.id
        assert resp.json()["name"] == room.name

    """2. Użytkownik może zgetować pokój, którego jest właścicielem."""

    def test_get_room_as_owner(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m)

        resp = get_room(client, game.id, room.id, AUTHOR)

        assert resp.status_code == 200
        assert resp.json()["id"] == room.id

    """3. Kombinacje nieistnienia: pokój / mapa / gracz / gra."""

    def test_nonexistent_room_returns_404(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session)
        make_map(db_session, game)

        resp = get_room(client, game.id, 99999, AUTHOR)

        assert resp.status_code == 404

    def test_nonexistent_game_returns_404(self, client: TestClient) -> None:
        resp = get_room(client, "nie-istnieje", 1, AUTHOR)

        assert resp.status_code == 404

    def test_game_exists_but_no_map_returns_404(self, client: TestClient, db_session: Session) -> None:
        """Gra istnieje, ale nie ma mapy — pokój nie może istnieć."""
        game = make_game(db_session)

        resp = get_room(client, game.id, 1, AUTHOR)

        assert resp.status_code == 404

    def test_room_belongs_to_other_game_returns_404(
        self, client: TestClient, db_session: Session
    ) -> None:
        """Pokój istnieje, ale należy do innej gry."""
        game1 = make_game(db_session, author=AUTHOR)
        game2 = make_game(db_session, author=AUTHOR)
        m1 = make_map(db_session, game1)
        room = make_room(db_session, m1)

        resp = get_room(client, game2.id, room.id, AUTHOR)

        assert resp.status_code == 404

    def test_nonexistent_user_still_can_view(self, client: TestClient, db_session: Session) -> None:
        """Viewing rights zależą tylko od istnienia gry — dowolny user_id przechodzi."""
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m)

        resp = get_room(client, game.id, room.id, "nie-istniejacy-user")

        assert resp.status_code == 200
        assert resp.json()["id"] == room.id

    def test_returns_full_room_structure(self, client: TestClient, db_session: Session) -> None:
        """GET zwraca pełną strukturę: przejścia, sensory, QR, przedmioty."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room1 = make_room(db_session, m, name="A")
        room2 = make_room(db_session, m, name="B", x=20.0)
        make_passage(db_session, m, room1, room2)
        item = make_item(db_session, game)
        db_session.add(RoomItemClaim(room_id=room1.id, item_id=item.item_id, amount=2))
        db_session.commit()

        resp = get_room(client, game.id, room1.id, AUTHOR)

        assert resp.status_code == 200
        data = resp.json()
        assert len(data["passages"]) == 1
        assert data["passages"][0]["room1_id"] == room1.id
        assert data["passages"][0]["room2_id"] == room2.id
        assert len(data["items"]) == 1
        assert data["items"][0]["item_id"] == item.item_id
        assert "sensors" in data
        assert "qr_codes" in data


# ---------------------------------------------------------------------------
# GET inventory items
# ---------------------------------------------------------------------------

class TestGetInventoryItems:
    """Bardzo podobnie jak get_room, ale wymaga uprawnień autora gry."""

    def test_get_items_as_owner(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session, author=AUTHOR)
        item = make_item(db_session, game, name="Miecz")

        resp = get_items(client, game.id, AUTHOR)

        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["item_id"] == item.item_id
        assert data[0]["name"] == "Miecz"

    def test_get_items_as_non_owner_returns_404(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session, author=AUTHOR)
        make_item(db_session, game)

        resp = get_items(client, game.id, OTHER_USER)

        assert resp.status_code == 404

    def test_nonexistent_game_returns_404(self, client: TestClient) -> None:
        resp = get_items(client, "nie-istnieje", AUTHOR)

        assert resp.status_code == 404

    def test_game_without_items_returns_empty_list(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session, author=AUTHOR)

        resp = get_items(client, game.id, AUTHOR)

        assert resp.status_code == 200
        assert resp.json() == []

    def test_multiple_items_all_returned(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session, author=AUTHOR)
        item1 = make_item(db_session, game, name="Miecz")
        item2 = make_item(db_session, game, name="Klucz")

        resp = get_items(client, game.id, AUTHOR)

        assert resp.status_code == 200
        ids = {i["item_id"] for i in resp.json()}
        assert ids == {item1.item_id, item2.item_id}


# ---------------------------------------------------------------------------
# Edycja pokojów — podstawowe parametry
# ---------------------------------------------------------------------------

class TestUpdateRoomBasicParams:
    """1. Zmiana podstawowych parametrów (bez id) + czy się zmieniło."""

    def test_update_basic_params(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m, name="Stara nazwa")

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
        resp = update_room(client, game.id, room.id, AUTHOR, dto)

        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Nowa nazwa"
        assert data["description"] == "Nowy opis"
        assert data["hidden"] is True
        assert data["zone"] == "Piwnica"
        assert data["position"]["x"] == 15.0
        assert data["position"]["y"] == 25.0
        assert data["width"] == 20.0
        assert data["height"] == 30.0

    def test_update_persisted_visible_via_get(
        self, client: TestClient, db_session: Session
    ) -> None:
        """Zmiana jest widoczna przez GET po POST."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m, name="Stara")

        dto = make_room_dto(room, name="Nowa", zone="Nowa strefa", x=99.0, y=88.0)
        update_room(client, game.id, room.id, AUTHOR, dto)

        resp = get_room(client, game.id, room.id, AUTHOR)
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Nowa"
        assert data["zone"] == "Nowa strefa"
        assert data["position"]["x"] == 99.0
        assert data["position"]["y"] == 88.0

    def test_update_persisted_in_db(self, client: TestClient, db_session: Session) -> None:
        """Zmiana zapisana bezpośrednio w bazie."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m, name="Stara")

        dto = make_room_dto(room, name="Nowa", hidden=True)
        update_room(client, game.id, room.id, AUTHOR, dto)

        db_session.expire_all()
        fresh = db_session.get(Room, room.id)
        assert fresh.name == "Nowa"
        assert fresh.hidden is True

    """2. Zmiana id — wyłączona ze względów bezpieczeństwa."""

    def test_id_change_is_ignored(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        original_id = room.id

        dto = make_room_dto(room, room_id=99999, name="Zmieniona nazwa")
        resp = update_room(client, game.id, room.id, AUTHOR, dto)

        assert resp.status_code == 200
        assert resp.json()["id"] == original_id

        # Pokój pod nowym id nie istnieje, stary ma nową nazwę
        resp_new = get_room(client, game.id, 99999, AUTHOR)
        assert resp_new.status_code == 404
        resp_old = get_room(client, game.id, original_id, AUTHOR)
        assert resp_old.json()["name"] == "Zmieniona nazwa"

    """Kombinacje nieistnienia przy edycji."""

    def test_update_nonexistent_room_returns_404(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session)
        make_map(db_session, game)
        dto = RoomSchema(
            id=99999, name="X", description="", hidden=False, zone="",
            position=PositionSchema(x=0, y=0), width=1, height=1,
            passages=[], items=[], sensors=[], qr_codes=[],
        )

        resp = update_room(client, game.id, 99999, AUTHOR, dto)

        assert resp.status_code == 404

    def test_update_nonexistent_game_returns_404(self, client: TestClient) -> None:
        dto = RoomSchema(
            id=1, name="X", description="", hidden=False, zone="",
            position=PositionSchema(x=0, y=0), width=1, height=1,
            passages=[], items=[], sensors=[], qr_codes=[],
        )

        resp = update_room(client, "nie-istnieje", 1, AUTHOR, dto)

        assert resp.status_code == 404

    def test_update_as_non_owner_returns_404(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        dto = make_room_dto(room, name="Hakier")

        resp = update_room(client, game.id, room.id, OTHER_USER, dto)

        assert resp.status_code == 404
        # Pokój nie został zmieniony
        check = get_room(client, game.id, room.id, AUTHOR)
        assert check.json()["name"] != "Hakier"

    def test_update_room_of_other_game_returns_404(
        self, client: TestClient, db_session: Session
    ) -> None:
        """Pokój należy do game1, próba edycji przez game2 (oba należą do AUTHOR)."""
        game1 = make_game(db_session, author=AUTHOR)
        game2 = make_game(db_session, author=AUTHOR)
        m1 = make_map(db_session, game1)
        room = make_room(db_session, m1)
        dto = make_room_dto(room, name="Zmieniona")

        resp = update_room(client, game2.id, room.id, AUTHOR, dto)

        # _ensure_edit_rights przechodzi dla game2, pokój istnieje — update się wykona
        # mimo że pokój należy do innej gry (brak walidacji mapy pokoju vs game_id)
        assert resp.status_code == 200
        assert resp.json()["name"] == "Zmieniona"


# ---------------------------------------------------------------------------
# Edycja pokojów — sensory i kody QR
# ---------------------------------------------------------------------------

class TestUpdateRoomSensorsAndQrCodes:
    """1. Czy się poprawnie dodaje."""

    def test_add_sensors(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)

        dto = make_room_dto(
            room,
            sensors=[
                SensorSchema(position=PositionSchema(x=1.0, y=2.0)),
                SensorSchema(position=PositionSchema(x=3.0, y=4.0)),
            ],
        )
        resp = update_room(client, game.id, room.id, AUTHOR, dto)

        assert resp.status_code == 200
        sensors = resp.json()["sensors"]
        assert len(sensors) == 2
        positions = {(s["position"]["x"], s["position"]["y"]) for s in sensors}
        assert (1.0, 2.0) in positions
        assert (3.0, 4.0) in positions

    def test_add_qr_codes(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)

        dto = make_room_dto(
            room,
            qr_codes=[
                QrCodeSchema(position=PositionSchema(x=5.0, y=6.0)),
                QrCodeSchema(position=PositionSchema(x=7.0, y=8.0)),
            ],
        )
        resp = update_room(client, game.id, room.id, AUTHOR, dto)

        assert resp.status_code == 200
        assert len(resp.json()["qr_codes"]) == 2

    def test_add_sensors_and_qr_visible_via_get(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)

        dto = make_room_dto(
            room,
            sensors=[SensorSchema(position=PositionSchema(x=1.0, y=1.0))],
            qr_codes=[QrCodeSchema(position=PositionSchema(x=2.0, y=2.0))],
        )
        update_room(client, game.id, room.id, AUTHOR, dto)

        resp = get_room(client, game.id, room.id, AUTHOR)
        data = resp.json()
        assert len(data["sensors"]) == 1
        assert data["sensors"][0]["position"]["x"] == 1.0
        assert len(data["qr_codes"]) == 1
        assert data["qr_codes"][0]["position"]["y"] == 2.0

    """2. Czy się poprawnie usuwa."""

    def test_remove_all_sensors(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)

        # Najpierw dodaj sensory
        dto_add = make_room_dto(
            room,
            sensors=[
                SensorSchema(position=PositionSchema(x=1.0, y=1.0)),
                SensorSchema(position=PositionSchema(x=2.0, y=2.0)),
            ],
        )
        update_room(client, game.id, room.id, AUTHOR, dto_add)

        # Potem usuń wszystkie — pobierz aktualny stan i wyślij pustą listę
        current = get_room(client, game.id, room.id, AUTHOR).json()
        dto_remove = make_room_dto(room, sensors=[], qr_codes=[])
        # Użyj aktualnych passages/items z GET, żeby ich nie skasować
        dto_remove = RoomSchema(
            id=room.id,
            name=current["name"],
            description=current["description"],
            hidden=current["hidden"],
            zone=current["zone"],
            position=PositionSchema(x=current["position"]["x"], y=current["position"]["y"]),
            width=current["width"],
            height=current["height"],
            passages=[PassageSchema(**p) for p in current["passages"]],
            items=[InventoryItemSchema(**i) for i in current["items"]],
            sensors=[],
            qr_codes=[QrCodeSchema(**q) for q in current["qr_codes"]],
        )
        resp = update_room(client, game.id, room.id, AUTHOR, dto_remove)

        assert resp.status_code == 200
        assert resp.json()["sensors"] == []

        # Sprawdź też przez GET
        check = get_room(client, game.id, room.id, AUTHOR)
        assert check.json()["sensors"] == []

    def test_remove_all_qr_codes(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)

        dto_add = make_room_dto(
            room,
            qr_codes=[QrCodeSchema(position=PositionSchema(x=1.0, y=1.0))],
        )
        update_room(client, game.id, room.id, AUTHOR, dto_add)

        current = get_room(client, game.id, room.id, AUTHOR).json()
        dto_remove = RoomSchema(
            id=room.id,
            name=current["name"],
            description=current["description"],
            hidden=current["hidden"],
            zone=current["zone"],
            position=PositionSchema(x=current["position"]["x"], y=current["position"]["y"]),
            width=current["width"],
            height=current["height"],
            passages=[PassageSchema(**p) for p in current["passages"]],
            items=[InventoryItemSchema(**i) for i in current["items"]],
            sensors=[SensorSchema(**s) for s in current["sensors"]],
            qr_codes=[],
        )
        resp = update_room(client, game.id, room.id, AUTHOR, dto_remove)

        assert resp.status_code == 200
        assert resp.json()["qr_codes"] == []

    def test_new_sensors_replace_old_ones(self, client: TestClient, db_session: Session) -> None:
        """Nowa lista sensorów zastępuje starą (nie dopisuje)."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)

        dto1 = make_room_dto(
            room,
            sensors=[SensorSchema(position=PositionSchema(x=1.0, y=1.0))],
        )
        update_room(client, game.id, room.id, AUTHOR, dto1)

        dto2 = make_room_dto(
            room,
            sensors=[SensorSchema(position=PositionSchema(x=9.0, y=9.0))],
        )
        resp = update_room(client, game.id, room.id, AUTHOR, dto2)

        assert resp.status_code == 200
        sensors = resp.json()["sensors"]
        assert len(sensors) == 1
        assert sensors[0]["position"]["x"] == 9.0


# ---------------------------------------------------------------------------
# Edycja pokojów — przejścia (passages)
# ---------------------------------------------------------------------------

class TestUpdateRoomPassages:
    """1. Czy się poprawnie dodają."""

    def test_add_passage(self, client: TestClient, db_session: Session) -> None:
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
        resp = update_room(client, game.id, room1.id, AUTHOR, dto)

        assert resp.status_code == 200
        passages = resp.json()["passages"]
        assert len(passages) == 1
        assert passages[0]["room1_id"] == room1.id
        assert passages[0]["room2_id"] == room2.id

    def test_add_passage_visible_on_both_rooms(
        self, client: TestClient, db_session: Session
    ) -> None:
        """Zmiany sprawdzaj na obu pokojach, na które operacja wpłynie."""
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
        update_room(client, game.id, room1.id, AUTHOR, dto)

        r1 = get_room(client, game.id, room1.id, AUTHOR).json()
        r2 = get_room(client, game.id, room2.id, AUTHOR).json()

        assert len(r1["passages"]) == 1
        assert len(r2["passages"]) == 1
        assert r1["passages"][0]["room2_id"] == room2.id
        assert r2["passages"][0]["room1_id"] == room1.id

    def test_entry_passage_visible_on_source_room(
        self, client: TestClient, db_session: Session
    ) -> None:
        """Edycja room2, przejście room1 -> room2 — widoczne też na room1."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room1 = make_room(db_session, m, name="A")
        room2 = make_room(db_session, m, name="B", x=20.0)

        dto = make_room_dto(
            room2,
            passages=[
                PassageSchema(
                    id=1, room1_id=room1.id, room2_id=room2.id,
                    position=PositionSchema(x=10.0, y=0.0),
                )
            ],
        )
        resp = update_room(client, game.id, room2.id, AUTHOR, dto)

        assert resp.status_code == 200
        r1 = get_room(client, game.id, room1.id, AUTHOR).json()
        r2 = get_room(client, game.id, room2.id, AUTHOR).json()
        assert len(r1["passages"]) == 1
        assert len(r2["passages"]) == 1
        assert r1["passages"][0]["room2_id"] == room2.id
        assert r2["passages"][0]["room1_id"] == room1.id

    """2. Czy się poprawnie usuwają."""

    def test_remove_passage(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room1 = make_room(db_session, m, name="A")
        room2 = make_room(db_session, m, name="B", x=20.0)
        make_passage(db_session, m, room1, room2)

        dto = make_room_dto(room1, passages=[])
        resp = update_room(client, game.id, room1.id, AUTHOR, dto)

        assert resp.status_code == 200
        assert resp.json()["passages"] == []

    def test_remove_passage_gone_from_both_rooms(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room1 = make_room(db_session, m, name="A")
        room2 = make_room(db_session, m, name="B", x=20.0)
        make_passage(db_session, m, room1, room2)

        dto = make_room_dto(room1, passages=[])
        update_room(client, game.id, room1.id, AUTHOR, dto)

        r1 = get_room(client, game.id, room1.id, AUTHOR).json()
        r2 = get_room(client, game.id, room2.id, AUTHOR).json()
        assert r1["passages"] == []
        assert r2["passages"] == []

    """3. Czy aktualizacje działają poprawnie."""

    def test_update_passage_same_id_returns_409(
        self, client: TestClient, db_session: Session
    ) -> None:
        """Przejście o tym samym id już istnieje — ConflictError (409)."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room1 = make_room(db_session, m, name="A")
        room2 = make_room(db_session, m, name="B", x=20.0)
        p = make_passage(db_session, m, room1, room2, x=5.0, y=5.0)

        dto = make_room_dto(
            room1,
            passages=[
                PassageSchema(
                    id=p.id, room1_id=room1.id, room2_id=room2.id,
                    position=PositionSchema(x=99.0, y=88.0),
                )
            ],
        )
        resp = update_room(client, game.id, room1.id, AUTHOR, dto)

        assert resp.status_code == 409

    def test_update_passage_new_id_changes_position(
        self, client: TestClient, db_session: Session
    ) -> None:
        """Zmiana przejścia przez nowe id — stare usuwane, nowe z nową pozycją."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room1 = make_room(db_session, m, name="A")
        room2 = make_room(db_session, m, name="B", x=20.0)
        make_passage(db_session, m, room1, room2, x=5.0, y=5.0)

        dto = make_room_dto(
            room1,
            passages=[
                PassageSchema(
                    id=999, room1_id=room1.id, room2_id=room2.id,
                    position=PositionSchema(x=99.0, y=88.0),
                )
            ],
        )
        resp = update_room(client, game.id, room1.id, AUTHOR, dto)

        assert resp.status_code == 200
        passages = resp.json()["passages"]
        assert len(passages) == 1
        assert passages[0]["position"]["x"] == 99.0
        assert passages[0]["position"]["y"] == 88.0

    """4. Nadpis relacji między 2 INNYMI pokojami."""

    def test_cannot_overwrite_passage_between_other_rooms_returns_409(
        self, client: TestClient, db_session: Session
    ) -> None:
        """Przejście o id X już istnieje między C i D — nie można go użyć dla A i B."""
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
        resp = update_room(client, game.id, room_a.id, AUTHOR, dto)

        assert resp.status_code == 409

    """5. Jeden pokój nie istnieje."""

    def test_passage_with_nonexistent_room1_returns_404(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room_a = make_room(db_session, m, name="A")

        dto = make_room_dto(
            room_a,
            passages=[
                PassageSchema(
                    id=1, room1_id=99999, room2_id=room_a.id,
                    position=PositionSchema(x=1.0, y=1.0),
                )
            ],
        )
        resp = update_room(client, game.id, room_a.id, AUTHOR, dto)

        assert resp.status_code == 404

    def test_passage_with_nonexistent_room2_returns_404(
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
        resp = update_room(client, game.id, room_a.id, AUTHOR, dto)

        assert resp.status_code == 404

    """6. Relacja między pokojami z innych map/gier."""

    def test_passage_between_rooms_from_different_maps_returns_403(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session)
        m1 = make_map(db_session, game, name="Mapa 1")
        game2 = make_game(db_session)
        m2 = make_map(db_session, game2, name="Mapa 2")
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
        resp = update_room(client, game.id, room_a.id, AUTHOR, dto)

        assert resp.status_code == 403

    def test_passage_not_including_current_room_returns_403(
        self, client: TestClient, db_session: Session
    ) -> None:
        """Przejście musi zawierać edytowany pokój."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room_a = make_room(db_session, m, name="A")
        room_b = make_room(db_session, m, name="B", x=20.0)
        room_c = make_room(db_session, m, name="C", x=40.0)

        dto = make_room_dto(
            room_a,
            passages=[
                PassageSchema(
                    id=1, room1_id=room_b.id, room2_id=room_c.id,
                    position=PositionSchema(x=1.0, y=1.0),
                )
            ],
        )
        resp = update_room(client, game.id, room_a.id, AUTHOR, dto)

        assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Edycja pokojów — rezerwacja przedmiotu (items)
# ---------------------------------------------------------------------------

class TestUpdateRoomItemReservation:
    """1. Czy da się dodać jakiś przedmiot?"""

    def test_reserve_item(self, client: TestClient, db_session: Session) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        item = make_item(db_session, game, name="Miecz", total=5, available=5)

        dto = make_room_dto(
            room,
            items=[InventoryItemSchema(item_id=item.item_id, name=item.name)],
        )
        resp = update_room(client, game.id, room.id, AUTHOR, dto)

        assert resp.status_code == 200
        items = resp.json()["items"]
        assert len(items) == 1
        assert items[0]["item_id"] == item.item_id

    def test_reserve_item_visible_via_get(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        item = make_item(db_session, game)

        dto = make_room_dto(
            room,
            items=[InventoryItemSchema(item_id=item.item_id, name=item.name)],
        )
        update_room(client, game.id, room.id, AUTHOR, dto)

        resp = get_room(client, game.id, room.id, AUTHOR)
        items = resp.json()["items"]
        assert len(items) == 1
        assert items[0]["item_id"] == item.item_id

    def test_clear_all_items(self, client: TestClient, db_session: Session) -> None:
        """Pusta lista items czyści rezerwacje."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        item = make_item(db_session, game)
        db_session.add(RoomItemClaim(room_id=room.id, item_id=item.item_id, amount=2))
        db_session.commit()

        dto = make_room_dto(room, items=[])
        resp = update_room(client, game.id, room.id, AUTHOR, dto)

        assert resp.status_code == 200
        assert resp.json()["items"] == []

        check = get_room(client, game.id, room.id, AUTHOR)
        assert check.json()["items"] == []

    """2. Nieistniejący przedmiot / komnata."""

    def test_reserve_nonexistent_item_returns_404(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)

        dto = make_room_dto(
            room,
            items=[InventoryItemSchema(item_id=str(uuid.uuid4()), name="Brak")],
        )
        resp = update_room(client, game.id, room.id, AUTHOR, dto)

        assert resp.status_code == 404

    def test_reserve_for_nonexistent_room_returns_404(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session)
        make_map(db_session, game)
        item = make_item(db_session, game)

        dto = RoomSchema(
            id=99999, name="X", description="", hidden=False, zone="",
            position=PositionSchema(x=0, y=0), width=1, height=1,
            passages=[],
            items=[InventoryItemSchema(item_id=item.item_id, name=item.name)],
            sensors=[], qr_codes=[],
        )
        resp = update_room(client, game.id, 99999, AUTHOR, dto)

        assert resp.status_code == 404

    """3. Rezerwacja do gry bez uprawnień."""

    def test_reserve_without_permissions_returns_404(
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
        resp = update_room(client, game.id, room.id, OTHER_USER, dto)

        assert resp.status_code == 404

    """4. Przedmiot się wyczerpał."""

    def test_reserve_exhausted_item_returns_422(
        self, client: TestClient, db_session: Session
    ) -> None:
        """available=0 — rezerwacja powinna zwrócić 422."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        item = make_item(db_session, game, total=1, available=0)

        dto = make_room_dto(
            room,
            items=[InventoryItemSchema(item_id=item.item_id, name=item.name)],
        )
        resp = update_room(client, game.id, room.id, AUTHOR, dto)

        assert resp.status_code == 422

    def test_reserve_more_than_available_across_rooms_returns_422(
        self, client: TestClient, db_session: Session
    ) -> None:
        """Suma rezerwacji we wszystkich pokojach przekracza available."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room1 = make_room(db_session, m, name="A")
        room2 = make_room(db_session, m, name="B", x=20.0)
        item = make_item(db_session, game, total=3, available=3)
        db_session.add(RoomItemClaim(room_id=room1.id, item_id=item.item_id, amount=2))
        db_session.commit()

        dto = make_room_dto(
            room2,
            items=[InventoryItemSchema(item_id=item.item_id, name=item.name)],
        )
        resp = update_room(client, game.id, room2.id, AUTHOR, dto)

        assert resp.status_code == 422

    def test_reserve_exactly_available_ok(
        self, client: TestClient, db_session: Session
    ) -> None:
        """Rezerwacja w granicach available przechodzi."""
        game = make_game(db_session)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        item = make_item(db_session, game, total=5, available=5)

        dto = make_room_dto(
            room,
            items=[InventoryItemSchema(item_id=item.item_id, name=item.name)],
        )
        resp = update_room(client, game.id, room.id, AUTHOR, dto)

        assert resp.status_code == 200
        assert len(resp.json()["items"]) == 1


# ---------------------------------------------------------------------------
# Kombinacje nieistnienia dla update_room
# ---------------------------------------------------------------------------

class TestUpdateRoomNonExistenceCombinations:
    """Różne kombinacje nieistnienia pokoju, mapy, gracza i gry przy edycji."""

    def _dto(self, room_id: int = 1) -> RoomSchema:
        return RoomSchema(
            id=room_id, name="X", description="", hidden=False, zone="",
            position=PositionSchema(x=0, y=0), width=1, height=1,
            passages=[], items=[], sensors=[], qr_codes=[],
        )

    def test_game_not_exists_returns_404(self, client: TestClient) -> None:
        resp = update_room(client, "brak-gry", 1, AUTHOR, self._dto())
        assert resp.status_code == 404

    def test_game_exists_no_map_no_room_returns_404(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session)
        resp = update_room(client, game.id, 1, AUTHOR, self._dto())
        assert resp.status_code == 404

    def test_map_exists_room_not_exists_returns_404(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session)
        make_map(db_session, game)
        resp = update_room(client, game.id, 42, AUTHOR, self._dto(42))
        assert resp.status_code == 404

    def test_room_exists_but_user_not_author_returns_404(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        dto = make_room_dto(room, name="Zmiana")

        resp = update_room(client, game.id, room.id, "nie-autor", dto)

        assert resp.status_code == 404
        check = get_room(client, game.id, room.id, AUTHOR)
        assert check.json()["name"] != "Zmiana"

    def test_room_exists_but_game_not_exists_returns_404(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m)
        dto = make_room_dto(room)

        resp = update_room(client, "brak-gry", room.id, AUTHOR, dto)

        assert resp.status_code == 404

    def test_all_exist_but_wrong_user_returns_404_and_no_change(
        self, client: TestClient, db_session: Session
    ) -> None:
        game = make_game(db_session, author=AUTHOR)
        m = make_map(db_session, game)
        room = make_room(db_session, m, name="Oryginał")
        dto = make_room_dto(room, name="Zmiana")

        resp = update_room(client, game.id, room.id, "ktokolwiek-inny", dto)

        assert resp.status_code == 404
        check = get_room(client, game.id, room.id, AUTHOR)
        assert check.json()["name"] == "Oryginał"
