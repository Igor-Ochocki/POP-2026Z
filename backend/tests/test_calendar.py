from datetime import datetime

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.game import Game
from app.models.time_slot import TimeSlot

URL = "/api/v1/calendar/events"


def seed_game(db: Session, title: str = "Noc w muzeum") -> Game:
    game = Game(
        author_id="author-1",
        title=title,
        description="opis",
        min_players=2,
        max_players=6,
        duration_minutes=90,
    )
    db.add(game)
    db.commit()
    return game


def seed_slot(db: Session, game: Game, start_time: datetime, **overrides) -> TimeSlot:
    slot = TimeSlot(game_id=game.id, start_time=start_time, location="Pokój RNG", base_price=50.0, **overrides)
    db.add(slot)
    db.commit()
    return slot


def test_get_events_returns_calendar_event_dto_shape(client: TestClient, db_session: Session) -> None:
    game = seed_game(db_session)
    slot = seed_slot(db_session, game, datetime(2026, 11, 14, 18, 30))

    response = client.get(URL, params={"month": "2026-11-01"})

    assert response.status_code == 200
    assert response.json() == [{"id": slot.id, "title": "Noc w muzeum", "datetime": "2026-11-14T18:30:00"}]


def test_get_events_filters_by_month(client: TestClient, db_session: Session) -> None:
    game = seed_game(db_session)
    seed_slot(db_session, game, datetime(2026, 10, 31, 23, 59))
    inside_first = seed_slot(db_session, game, datetime(2026, 11, 1, 0, 0))
    inside_last = seed_slot(db_session, game, datetime(2026, 11, 30, 23, 59))
    seed_slot(db_session, game, datetime(2026, 12, 1, 0, 0))

    response = client.get(URL, params={"month": "2026-11-17"})

    assert response.status_code == 200
    assert [event["id"] for event in response.json()] == [inside_first.id, inside_last.id]


def test_get_events_december_does_not_leak_into_next_year(client: TestClient, db_session: Session) -> None:
    game = seed_game(db_session)
    december = seed_slot(db_session, game, datetime(2026, 12, 31, 20, 0))
    seed_slot(db_session, game, datetime(2027, 1, 1, 10, 0))

    response = client.get(URL, params={"month": "2026-12-01"})

    assert [event["id"] for event in response.json()] == [december.id]


def test_get_events_includes_taken_slots_sorted_by_datetime(client: TestClient, db_session: Session) -> None:
    game = seed_game(db_session, "Tożsamość")
    later = seed_slot(db_session, game, datetime(2026, 11, 20, 18, 0), is_available=False)
    earlier = seed_slot(db_session, game, datetime(2026, 11, 5, 18, 0))

    response = client.get(URL, params={"month": "2026-11-01"})

    assert [event["id"] for event in response.json()] == [earlier.id, later.id]


def test_get_events_empty_month_returns_empty_list(client: TestClient, db_session: Session) -> None:
    response = client.get(URL, params={"month": "2026-11-01"})

    assert response.status_code == 200
    assert response.json() == []


def test_get_events_without_month_returns_422(client: TestClient) -> None:
    response = client.get(URL)

    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["query", "month"]


def test_get_events_invalid_month_returns_422(client: TestClient) -> None:
    response = client.get(URL, params={"month": "listopad"})

    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["query", "month"]


def test_old_slots_endpoint_no_longer_exists(client: TestClient) -> None:
    paths = client.get("/openapi.json").json()["paths"]

    assert "/api/v1/reservations/slots" not in paths
    assert "/api/v1/calendar/events" in paths
