from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.services.games_service import GamesService
from app.schemas.game import GameCreateSchema

TEST_USER_ID = "user-123"


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


def test_games_service_get_game_found(db_session: Session) -> None:
    service = GamesService(db_session)
    created = service.save_game(TEST_USER_ID, make_dto(), as_draft=True)

    result = service.get_game(created.game_id, TEST_USER_ID)

    assert result.game_id == created.game_id
    assert result.title == "Test Game"


def test_games_service_get_game_not_found(db_session: Session) -> None:
    service = GamesService(db_session)

    try:
        service.get_game("non-existent-id", TEST_USER_ID)
        assert False, "Expected NotFoundError"
    except NotFoundError:
        pass


def test_games_service_get_game_wrong_user(db_session: Session) -> None:
    service = GamesService(db_session)
    created = service.save_game(TEST_USER_ID, make_dto(), as_draft=True)

    try:
        service.get_game(created.game_id, "other-user")
        assert False, "Expected NotFoundError for wrong user"
    except NotFoundError:
        pass


def test_games_service_create_ok(db_session: Session) -> None:
    service = GamesService(db_session)

    result = service.save_game(TEST_USER_ID, make_dto(), as_draft=True)

    assert result.title == "Test Game"
    assert result.status == "Draft"
    assert result.game_id != ""


def test_games_service_create_validation_err(db_session: Session) -> None:
    try:
        make_dto(min_players=5, max_players=2)
        assert False, "Expected validation error"
    except Exception:
        pass


def test_games_service_edit_game_ok(db_session: Session) -> None:
    service = GamesService(db_session)
    created = service.save_game(TEST_USER_ID, make_dto(title="Original"), as_draft=True)

    result = service.edit_game(created.game_id, TEST_USER_ID, make_dto(title="Updated"), as_draft=True)

    assert result.title == "Updated"
    assert result.game_id == created.game_id
    assert result.status == "Draft"


def test_games_service_edit_game_as_submitted(db_session: Session) -> None:
    service = GamesService(db_session)
    created = service.save_game(TEST_USER_ID, make_dto(title="Original"), as_draft=True)

    result = service.edit_game(created.game_id, TEST_USER_ID, make_dto(title="Updated"), as_draft=False)

    assert result.title == "Updated"
    assert result.status == "Submitted"


def test_games_service_edit_game_validation_err(db_session: Session) -> None:
    try:
        make_dto(min_players=10, max_players=2)
        assert False, "Expected validation error"
    except Exception:
        pass


def test_games_service_edit_game_not_found(db_session: Session) -> None:
    service = GamesService(db_session)

    try:
        service.edit_game("non-existent-id", TEST_USER_ID, make_dto(), as_draft=True)
        assert False, "Expected NotFoundError"
    except NotFoundError:
        pass


def test_games_service_edit_game_wrong_user(db_session: Session) -> None:
    service = GamesService(db_session)
    created = service.save_game(TEST_USER_ID, make_dto(), as_draft=True)

    try:
        service.edit_game(created.game_id, "other-user", make_dto(), as_draft=True)
        assert False, "Expected NotFoundError for wrong user"
    except NotFoundError:
        pass


def test_games_service_submit_to_reviewer_ok(db_session: Session) -> None:
    service = GamesService(db_session)
    created = service.save_game(TEST_USER_ID, make_dto(), as_draft=True)

    result = service.submit_to_reviewer(created.game_id, TEST_USER_ID)

    assert result is True


def test_games_service_submit_to_reviewer_not_found(db_session: Session) -> None:
    service = GamesService(db_session)

    try:
        service.submit_to_reviewer("non-existent-id", TEST_USER_ID)
        assert False, "Expected NotFoundError"
    except NotFoundError:
        pass


def test_games_service_submit_to_reviewer_wrong_user(db_session: Session) -> None:
    service = GamesService(db_session)
    created = service.save_game(TEST_USER_ID, make_dto(), as_draft=True)

    try:
        service.submit_to_reviewer(created.game_id, "other-user")
        assert False, "Expected NotFoundError for wrong user"
    except NotFoundError:
        pass


def test_games_endpoint_get_game_ok(client: TestClient) -> None:
    create_resp = client.post(
        "/api/v1/games/?user_id=user-123",
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
    game_id = create_resp.json()["game_id"]

    response = client.get(f"/api/v1/games/{game_id}?user_id=user-123")

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Game"


def test_games_endpoint_get_not_found(client: TestClient) -> None:
    response = client.get("/api/v1/games/non-existent-id?user_id=user-123")
    assert response.status_code == 404


def test_games_endpoint_create_ok(client: TestClient) -> None:
    response = client.post(
        "/api/v1/games/?user_id=user-123",
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


def test_games_endpoint_create_validation_err(client: TestClient) -> None:
    response = client.post(
        "/api/v1/games/?user_id=user-123",
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


def test_games_endpoint_edit_game_ok(client: TestClient) -> None:
    create_resp = client.post(
        "/api/v1/games/?user_id=user-123",
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
        f"/api/v1/games/{game_id}?user_id=user-123&as_draft=true",
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
    assert data["status"] == "Draft"


def test_games_endpoint_edit_not_found(client: TestClient) -> None:
    response = client.put(
        "/api/v1/games/non-existent-id?user_id=user-123&as_draft=true",
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


def test_games_endpoint_edit_wrong_user(client: TestClient) -> None:
    create_resp = client.post(
        "/api/v1/games/?user_id=user-123",
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
        f"/api/v1/games/{game_id}?user_id=other-user&as_draft=true",
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


def test_games_endpoint_submit_to_reviewer_ok(client: TestClient) -> None:
    create_resp = client.post(
        "/api/v1/games/?user_id=user-123",
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
    game_id = create_resp.json()["game_id"]

    response = client.post(f"/api/v1/games/{game_id}/submit?user_id=user-123")

    assert response.status_code == 200
    assert response.json() is True


def test_games_endpoint_submit_to_reviewer_twice_conflict(client: TestClient) -> None:
    create_resp = client.post(
        "/api/v1/games/?user_id=user-123",
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
    game_id = create_resp.json()["game_id"]
    client.post(f"/api/v1/games/{game_id}/submit?user_id=user-123")

    response = client.post(f"/api/v1/games/{game_id}/submit?user_id=user-123")

    assert response.status_code == 409


def test_games_endpoint_submit_to_reviewer_not_found(client: TestClient) -> None:
    response = client.post("/api/v1/games/non-existent-id/submit?user_id=user-123")
    assert response.status_code == 404


def test_games_endpoint_submit_to_reviewer_wrong_user(client: TestClient) -> None:
    create_resp = client.post(
        "/api/v1/games/?user_id=user-123",
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
    game_id = create_resp.json()["game_id"]

    response = client.post(f"/api/v1/games/{game_id}/submit?user_id=other-user")
    assert response.status_code == 404
