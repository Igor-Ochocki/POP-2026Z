from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.seed import SEED_GAMES, SLOT_PLAN, seed_database
from app.models.game import Game
from app.models.time_slot import TimeSlot


def test_seed_adds_games_and_slots_once(db_session: Session) -> None:
    bind = db_session.get_bind()

    assert seed_database(bind, today=date(2026, 11, 10)) is True
    assert seed_database(bind, today=date(2026, 11, 10)) is False

    assert db_session.scalar(select(func.count()).select_from(Game)) == len(SEED_GAMES)
    assert db_session.scalar(select(func.count()).select_from(TimeSlot)) == len(SLOT_PLAN)


def test_seeded_slots_are_visible_in_calendar(client, db_session: Session) -> None:
    seed_database(db_session.get_bind(), today=date(2026, 11, 10))

    response = client.get("/api/v1/calendar/events", params={"month": "2026-11-01"})

    assert response.status_code == 200
    assert len(response.json()) > 0
