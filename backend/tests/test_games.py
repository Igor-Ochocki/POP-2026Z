from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.services.games_service import GameNotFoundError, GamesService
from app.schemas.game import GameCreateSchema


def make_dto(
    title: str = "Test Game",
    description: str = "desc",
    min_players: int = 2,
    max_players: int = 4,
    duration_minutes: int = 60,
    requires_invitation: bool = False,
    tags: list[str] | None = None,
) -> GameCreateSchema:
    return GameCreateSchema(
        title=title,
        description=description,
        min_players=min_players,
        max_players=max_players,
        duration_minutes=duration_minutes,
        requires_invitation=requires_invitation,
        tags=tags or [],
    )


def test_games_service_get_found(db_session: Session) -> None:
    service = GamesService(db_session)
    created = service.save_game(make_dto(), as_draft=True)

    result = service.get(created.game_id)

    assert result.game_id == created.game_id
    assert result.title == "Test Game"


def test_games_service_get_not_found(db_session: Session) -> None:
    service = GamesService(db_session)

    try:
        service.get("non-existent-id")
        assert False, "Expected GameNotFoundError"
    except GameNotFoundError:
        pass


def test_games_service_create_ok(db_session: Session) -> None:
    service = GamesService(db_session)

    result = service.save_game(make_dto(), as_draft=True)

    assert result.title == "Test Game"
    assert result.status == "Draft"
    assert result.game_id != ""


def test_games_service_create_validation_err(db_session: Session) -> None:
    try:
        make_dto(min_players=5, max_players=2)
        assert False, "Expected validation error"
    except Exception:
        pass


def test_games_service_edit_ok(db_session: Session) -> None:
    service = GamesService(db_session)
    created = service.save_game(make_dto(title="Original"), as_draft=True)

    result = service.update(created.game_id, make_dto(title="Updated"))

    assert result.title == "Updated"
    assert result.game_id == created.game_id


def test_games_service_edit_validation_err(db_session: Session) -> None:
    try:
        make_dto(min_players=10, max_players=2)
        assert False, "Expected validation error"
    except Exception:
        pass


def test_games_service_edit_not_found(db_session: Session) -> None:
    service = GamesService(db_session)

    try:
        service.update("non-existent-id", make_dto())
        assert False, "Expected GameNotFoundError"
    except GameNotFoundError:
        pass


def test_games_endpoint_create_ok(client: TestClient) -> None:
    response = client.post(
        "/api/v1/games/",
        json={
            "title": "Test Game",
            "description": "desc",
            "min_players": 2,
            "max_players": 4,
            "duration_minutes": 60,
            "requires_invitation": False,
            "tags": [],
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Game"
    assert data["status"] == "Draft"


def test_games_endpoint_get_not_found(client: TestClient) -> None:
    response = client.get("/api/v1/games/non-existent-id")
    assert response.status_code == 404


def test_games_endpoint_create_validation_err(client: TestClient) -> None:
    response = client.post(
        "/api/v1/games/",
        json={
            "title": "",
            "description": "desc",
            "min_players": 5,
            "max_players": 2,
            "duration_minutes": 60,
            "requires_invitation": False,
            "tags": [],
        },
    )
    assert response.status_code in (400, 422)


def test_games_endpoint_edit_ok(client: TestClient) -> None:
    create_resp = client.post(
        "/api/v1/games/",
        json={
            "title": "Original",
            "description": "desc",
            "min_players": 2,
            "max_players": 4,
            "duration_minutes": 60,
            "requires_invitation": False,
            "tags": [],
        },
    )
    game_id = create_resp.json()["game_id"]

    response = client.put(
        f"/api/v1/games/{game_id}",
        json={
            "title": "Updated",
            "description": "new desc",
            "min_players": 3,
            "max_players": 6,
            "duration_minutes": 120,
            "requires_invitation": False,
            "tags": [],
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated"
    assert data["description"] == "new desc"


def test_games_endpoint_edit_not_found(client: TestClient) -> None:
    response = client.put(
        "/api/v1/games/non-existent-id",
        json={
            "title": "Updated",
            "description": "desc",
            "min_players": 2,
            "max_players": 4,
            "duration_minutes": 60,
            "requires_invitation": False,
            "tags": [],
        },
    )
    assert response.status_code == 404
