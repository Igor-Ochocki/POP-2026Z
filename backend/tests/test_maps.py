from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenError, NotFoundError
from app.models.character import Character
from app.models.game import Game, GameStatus
from app.models.map import Map, Passage, Room
from app.services.maps_service import MapsService


TEST_USER = "user-map-1"
OTHER_USER = "user-map-2"


def _seed_game(session: Session) -> Game:
    game = Game(
        author_id=TEST_USER,
        title="Map Game",
        description="Test game for map",
        min_players=2,
        max_players=4,
        duration_minutes=60,
        status=GameStatus.Approved,
    )
    session.add(game)
    session.flush()
    return game


def _seed_map(session: Session, game: Game) -> Map:
    m = Map(game_id=game.id, name="Dungeon")
    session.add(m)
    session.flush()

    r1 = Room(map_id=m.id, name="Sala Tronowa", description="Główna sala", zone="A",
              position_x=0.0, position_y=0.0, width=4.0, height=3.0, hidden=False)
    r2 = Room(map_id=m.id, name="Korytarz", description="Ciemny korytarz", zone="B",
              position_x=5.0, position_y=0.0, width=2.0, height=1.0, hidden=False)
    r3 = Room(map_id=m.id, name="Skarbiec", description="Skarbiec króla", zone="C",
              position_x=8.0, position_y=0.0, width=3.0, height=3.0, hidden=True)
    session.add_all([r1, r2, r3])
    session.flush()

    p1 = Passage(map_id=m.id, room1_id=r1.id, room2_id=r2.id)
    p2 = Passage(map_id=m.id, room1_id=r2.id, room2_id=r3.id)
    session.add_all([p1, p2])
    session.flush()

    return m


def _seed_character(session: Session, game: Game, user_id: str, zones: list[str]) -> Character:
    c = Character(game_id=game.id, user_id=user_id, name="Postać Testowa", access_zones=zones)
    session.add(c)
    session.flush()
    return c


# --- Testy serwisowe ---

def test_maps_service_full_access(db_session: Session) -> None:
    """Postać z dostępem do wszystkich stref widzi wszystko."""
    game = _seed_game(db_session)
    _seed_map(db_session, game)
    _seed_character(db_session, game, TEST_USER, ["A", "B", "C"])
    db_session.commit()

    svc = MapsService(db_session)
    result = svc.get_player_map(game.id, TEST_USER)

    assert len(result.rooms) == 3
    assert all(r.access == "accessible" for r in result.rooms)
    assert all(r.name is not None for r in result.rooms)
    assert len(result.passages) == 2


def test_maps_service_partial_access_outline(db_session: Session) -> None:
    """Postać ze strefą A widzi B jako outline, C (hidden) jest pomijana."""
    game = _seed_game(db_session)
    _seed_map(db_session, game)
    _seed_character(db_session, game, TEST_USER, ["A"])
    db_session.commit()

    svc = MapsService(db_session)
    result = svc.get_player_map(game.id, TEST_USER)

    accessible = [r for r in result.rooms if r.access == "accessible"]
    outlines = [r for r in result.rooms if r.access == "outline"]

    assert len(accessible) == 1
    assert accessible[0].name == "Sala Tronowa"
    assert len(outlines) == 1
    assert outlines[0].name is None
    assert outlines[0].description is None

    # Skarbiec (hidden=True, brak uprawnień) nie powinien się pojawić
    assert len(result.rooms) == 2


def test_maps_service_hidden_room_filtered(db_session: Session) -> None:
    """Ukryta komnata bez uprawnień nie jest zwracana."""
    game = _seed_game(db_session)
    _seed_map(db_session, game)
    _seed_character(db_session, game, TEST_USER, ["A", "B"])
    db_session.commit()

    svc = MapsService(db_session)
    result = svc.get_player_map(game.id, TEST_USER)

    room_ids = {r.room_id for r in result.rooms}
    assert len(result.rooms) == 2  # A i B, nie C (hidden)

    # Passage między B a C nie powinien się pojawić
    assert len(result.passages) == 1


def test_maps_service_passages_filtered_by_visible_rooms(db_session: Session) -> None:
    """Przejścia prowadzące do niewidocznych komnat nie są zwracane."""
    game = _seed_game(db_session)
    _seed_map(db_session, game)
    _seed_character(db_session, game, TEST_USER, ["A"])
    db_session.commit()

    svc = MapsService(db_session)
    result = svc.get_player_map(game.id, TEST_USER)

    # A jest accessible, B jest outline - oba widoczne -> passage między nimi jest
    visible_ids = {r.room_id for r in result.rooms}
    for p in result.passages:
        assert p.room1_id in visible_ids
        assert p.room2_id in visible_ids


def test_maps_service_no_map_raises_not_found(db_session: Session) -> None:
    """Brak mapy dla gry -> NotFoundError."""
    game = _seed_game(db_session)
    _seed_character(db_session, game, TEST_USER, ["A"])
    db_session.commit()

    svc = MapsService(db_session)
    try:
        svc.get_player_map(game.id, TEST_USER)
        assert False, "Expected NotFoundError"
    except NotFoundError:
        pass


def test_maps_service_no_character_raises_forbidden(db_session: Session) -> None:
    """Użytkownik bez postaci w grze -> ForbiddenError."""
    game = _seed_game(db_session)
    _seed_map(db_session, game)
    db_session.commit()

    svc = MapsService(db_session)
    try:
        svc.get_player_map(game.id, TEST_USER)
        assert False, "Expected ForbiddenError"
    except ForbiddenError:
        pass


def test_maps_service_nonexistent_game_raises_not_found(db_session: Session) -> None:
    """Nieistniejąca gra -> NotFoundError."""
    svc = MapsService(db_session)
    try:
        svc.get_player_map("non-existent-game-id", TEST_USER)
        assert False, "Expected NotFoundError"
    except NotFoundError:
        pass


# --- Testy endpointów ---

def test_maps_endpoint_get_player_map_ok(client: TestClient, db_session: Session) -> None:
    game = _seed_game(db_session)
    _seed_map(db_session, game)
    _seed_character(db_session, game, TEST_USER, ["A", "B", "C"])
    db_session.commit()

    response = client.get(f"/api/v1/games/{game.id}/map/player?user_id={TEST_USER}")

    assert response.status_code == 200
    data = response.json()
    assert data["game_id"] == game.id
    assert len(data["rooms"]) == 3
    assert len(data["passages"]) == 2


def test_maps_endpoint_no_map_404(client: TestClient, db_session: Session) -> None:
    game = _seed_game(db_session)
    _seed_character(db_session, game, TEST_USER, ["A"])
    db_session.commit()

    response = client.get(f"/api/v1/games/{game.id}/map/player?user_id={TEST_USER}")
    assert response.status_code == 404


def test_maps_endpoint_no_character_403(client: TestClient, db_session: Session) -> None:
    game = _seed_game(db_session)
    _seed_map(db_session, game)
    db_session.commit()

    response = client.get(f"/api/v1/games/{game.id}/map/player?user_id={TEST_USER}")
    assert response.status_code == 403


def test_maps_endpoint_missing_user_id_422(client: TestClient, db_session: Session) -> None:
    game = _seed_game(db_session)
    db_session.commit()

    response = client.get(f"/api/v1/games/{game.id}/map/player")
    assert response.status_code == 422
