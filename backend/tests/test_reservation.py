from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.message import Message
from app.models.payment import Payment
from app.services.calendar_service import ICalendarService
from tests.test_calendar import seed_slot

RESERVATIONS = "/api/v1/reservations"


def test_create_reservation_marks_slot_busy(
    client: TestClient, db_session: Session
) -> None:
    slot = seed_slot(db_session, base_price=40.0)

    response = client.post(
        RESERVATIONS,
        json={
            "slot_id": slot.id,
            "game_id": slot.game_id,
            "participant_count": 4,
        },
    )

    assert response.status_code == 201
    summary = response.json()
    assert summary["slot_id"] == slot.id
    assert summary["organizer_id"] == "demo-organizer"
    assert summary["total_cost"] == 160.0
    assert summary["status"] == "unpaid"
    assert summary["is_paid"] is False

    slot = db_session.get(slot.__class__, slot.id)
    assert slot.is_available is False


def test_create_reservation_on_taken_slot_conflicts(
    client: TestClient, db_session: Session
) -> None:
    slot = seed_slot(db_session)

    first = client.post(
        RESERVATIONS,
        json={"slot_id": slot.id, "game_id": slot.game_id, "participant_count": 2},
    )
    assert first.status_code == 201

    second = client.post(
        RESERVATIONS,
        json={"slot_id": slot.id, "game_id": slot.game_id, "participant_count": 2},
    )
    assert second.status_code == 409


def test_create_reservation_for_unknown_slot_fails(
    client: TestClient, db_session: Session
) -> None:
    response = client.post(
        RESERVATIONS,
        json={"slot_id": "brak", "game_id": "game-1", "participant_count": 2},
    )
    assert response.status_code == 404


def test_cancel_unpaid_reservation_frees_slot(
    client: TestClient, db_session: Session
) -> None:
    slot = seed_slot(db_session)
    created = client.post(
        RESERVATIONS,
        json={"slot_id": slot.id, "game_id": slot.game_id, "participant_count": 2},
    )
    reservation_id = created.json()["reservation_id"]

    response = client.delete(f"{RESERVATIONS}/{reservation_id}")

    assert response.status_code == 200
    assert response.json() is True

    slot = db_session.get(slot.__class__, slot.id)
    assert slot.is_available is True
    cancelled = client.post(
        RESERVATIONS,
        json={"slot_id": slot.id, "game_id": slot.game_id, "participant_count": 2},
    )
    assert cancelled.status_code == 201


def test_cancel_unknown_reservation_fails(client: TestClient) -> None:
    response = client.delete(f"{RESERVATIONS}/brak")
    assert response.status_code == 404


def test_payment_confirms_reservation_and_sends_inbox_message(
    client: TestClient, db_session: Session
) -> None:
    slot = seed_slot(db_session)
    created = client.post(
        RESERVATIONS,
        json={"slot_id": slot.id, "game_id": slot.game_id, "participant_count": 3},
    )
    reservation_id = created.json()["reservation_id"]

    response = client.post(f"{RESERVATIONS}/{reservation_id}/payment")

    assert response.status_code == 200
    summary = response.json()
    assert summary["status"] == "confirmed"
    assert summary["is_paid"] is True

    payments = db_session.scalars(select(Payment)).all()
    assert len(payments) == 1
    assert payments[0].reservation_id == reservation_id
    assert payments[0].status.value == "completed"

    messages = db_session.scalars(
        select(Message).where(Message.recipient_id == "demo-organizer")
    ).all()
    assert len(messages) == 1
    assert messages[0].reservation_id == reservation_id
    assert slot.title in messages[0].content
    assert messages[0].is_read is False


def test_payment_of_unknown_reservation_fails(client: TestClient) -> None:
    response = client.post(f"{RESERVATIONS}/brak/payment")
    assert response.status_code == 404


def test_double_payment_conflicts(client: TestClient, db_session: Session) -> None:
    slot = seed_slot(db_session)
    created = client.post(
        RESERVATIONS,
        json={"slot_id": slot.id, "game_id": slot.game_id, "participant_count": 1},
    )
    reservation_id = created.json()["reservation_id"]

    first = client.post(f"{RESERVATIONS}/{reservation_id}/payment")
    assert first.status_code == 200

    second = client.post(f"{RESERVATIONS}/{reservation_id}/payment")
    assert second.status_code == 409


def test_cancelled_reservation_cannot_be_paid(
    client: TestClient, db_session: Session
) -> None:
    slot = seed_slot(db_session)
    created = client.post(
        RESERVATIONS,
        json={"slot_id": slot.id, "game_id": slot.game_id, "participant_count": 1},
    )
    reservation_id = created.json()["reservation_id"]
    client.delete(f"{RESERVATIONS}/{reservation_id}")

    response = client.post(f"{RESERVATIONS}/{reservation_id}/payment")
    assert response.status_code == 409


def test_paid_reservation_cannot_be_cancelled(
    client: TestClient, db_session: Session
) -> None:
    slot = seed_slot(db_session)
    created = client.post(
        RESERVATIONS,
        json={"slot_id": slot.id, "game_id": slot.game_id, "participant_count": 1},
    )
    reservation_id = created.json()["reservation_id"]
    client.post(f"{RESERVATIONS}/{reservation_id}/payment")

    response = client.delete(f"{RESERVATIONS}/{reservation_id}")
    assert response.status_code == 409
