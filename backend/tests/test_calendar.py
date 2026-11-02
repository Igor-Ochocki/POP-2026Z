from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.time_slot import TimeSlot


def seed_slot(db: Session, *, title: str = "Gra testowa", **overrides) -> TimeSlot:
    slot = TimeSlot(
        game_id="game-1",
        title=title,
        start_time=datetime.now(timezone.utc) + timedelta(days=1),
        location="Pokój RNG",
        base_price=50.0,
    )
    for key, value in overrides.items():
        setattr(slot, key, value)
    db.add(slot)
    db.commit()
    return slot


def test_query_available_slots_returns_slots(
    client: TestClient, db_session: Session
) -> None:
    seed_slot(db_session, title="Noc w muzeum")
    seed_slot(db_session, title="Tożsamość")

    response = client.get("/api/v1/reservations/slots")

    assert response.status_code == 200
    slots = response.json()
    assert len(slots) == 2
    assert {slot["title"] for slot in slots} == {"Noc w muzeum", "Tożsamość"}
    for slot in slots:
        assert slot["slot_id"]
        assert slot["game_id"] == "game-1"
        assert isinstance(slot["start_time"], str)
        assert isinstance(slot["is_available"], bool)
        assert slot["base_price"] == 50.0


def test_query_available_slots_includes_occupied_slots(
    client: TestClient, db_session: Session
) -> None:
    """PU1 shows both free and taken slots (free vs busy in the calendar)."""
    seed_slot(db_session)
    seed_slot(db_session, title="Zajęty slot", is_available=False)

    response = client.get("/api/v1/reservations/slots")

    assert response.status_code == 200
    availability = {
        slot["title"]: slot["is_available"] for slot in response.json()
    }
    assert availability["Gra testowa"] is True
    assert availability["Zajęty slot"] is False


def test_query_available_slots_sorted_by_start_time(
    client: TestClient, db_session: Session
) -> None:
    later = datetime.now(timezone.utc) + timedelta(days=3)
    earlier = datetime.now(timezone.utc) + timedelta(days=1)
    seed_slot(db_session, title="Późniejszy", start_time=later)
    seed_slot(db_session, title="Wcześniejszy", start_time=earlier)

    response = client.get("/api/v1/reservations/slots")

    assert response.status_code == 200
    titles = [slot["title"] for slot in response.json()]
    assert titles == ["Wcześniejszy", "Późniejszy"]
