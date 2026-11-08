from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.scenario import Scenario
from app.models.task import Task
from app.schemas.game import GameCreateSchema
from app.services.games_service import GamesService
from app.services.scenarios_service import ScenariosService

TEST_USER_ID = "user-123"


def create_game(db_session: Session, user_id: str = TEST_USER_ID) -> str:
    dto = GameCreateSchema(
        title="Test Game",
        description="desc",
        min_players=2,
        max_players=4,
        duration_minutes=60,
    )
    return GamesService(db_session).save_game(user_id, dto, as_draft=True).game_id


def add_task(db_session: Session, scenario_id: str, position: int, title: str) -> None:
    db_session.add(
        Task(
            scenario_id=scenario_id,
            position=position,
            title=title,
            narrative="n",
            interaction_type="qr",
            interaction_target_id=f"target-{position}",
            reward_type="points",
            reward_value="10",
        )
    )
    db_session.commit()


def test_load_scenario_creates_empty_scenario(db_session: Session) -> None:
    game_id = create_game(db_session)

    result = ScenariosService(db_session).load_scenario(game_id, TEST_USER_ID)

    assert result.game_id == game_id
    assert result.scenario_id != ""
    assert result.tasks == []
    assert result.victory_conditions == []


def test_load_scenario_is_idempotent(db_session: Session) -> None:
    game_id = create_game(db_session)
    service = ScenariosService(db_session)

    first = service.load_scenario(game_id, TEST_USER_ID)
    second = service.load_scenario(game_id, TEST_USER_ID)

    assert first.scenario_id == second.scenario_id
    assert db_session.query(Scenario).count() == 1


def test_load_scenario_returns_tasks_in_order(db_session: Session) -> None:
    game_id = create_game(db_session)
    service = ScenariosService(db_session)
    scenario_id = service.load_scenario(game_id, TEST_USER_ID).scenario_id
    add_task(db_session, scenario_id, 1, "Drugie")
    add_task(db_session, scenario_id, 0, "Pierwsze")
    db_session.expire_all()

    result = service.load_scenario(game_id, TEST_USER_ID)

    assert [task.title for task in result.tasks] == ["Pierwsze", "Drugie"]
    assert result.tasks[0].task_id != ""
    assert result.tasks[0].required_player_level == 1
    assert result.tasks[0].time_limit_minutes is None


def test_load_scenario_game_not_found(db_session: Session) -> None:
    try:
        ScenariosService(db_session).load_scenario("non-existent-id", TEST_USER_ID)
        assert False, "Expected NotFoundError"
    except NotFoundError:
        pass


def test_load_scenario_wrong_user(db_session: Session) -> None:
    game_id = create_game(db_session)

    try:
        ScenariosService(db_session).load_scenario(game_id, "other-user")
        assert False, "Expected NotFoundError for wrong user"
    except NotFoundError:
        pass


def test_get_scenario_endpoint_ok(client: TestClient, db_session: Session) -> None:
    game_id = create_game(db_session)

    response = client.get(f"/api/v1/games/{game_id}/scenario", params={"user_id": TEST_USER_ID})

    assert response.status_code == 200
    body = response.json()
    assert body["game_id"] == game_id
    assert body["tasks"] == []
    assert body["victory_conditions"] == []


def test_get_scenario_endpoint_not_found(client: TestClient) -> None:
    response = client.get("/api/v1/games/non-existent-id/scenario", params={"user_id": TEST_USER_ID})

    assert response.status_code == 404
