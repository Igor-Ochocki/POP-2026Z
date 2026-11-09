from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import ReservationStatus
from app.models.message import Message
from app.models.payment import Payment
from app.models.reservation import Reservation
from app.models.time_slot import TimeSlot
from tests.test_calendar import seed_game, seed_slot

URL = "/api/v1/reservations"
ORGANIZER = {"user_id": "organizer-1"}
OTHER_USER = {"user_id": "organizer-2"}


@pytest.fixture
def slot(db_session: Session) -> TimeSlot:
    game = seed_game(db_session)  # 2-6 graczy
    return seed_slot(db_session, game, datetime(2026, 11, 14, 18, 0))


def reserve(client: TestClient, slot: TimeSlot, count: int = 4, params: dict = ORGANIZER):
    return client.post(
        URL, params=params, json={"slot_id": slot.id, "participant_count": count}
    )


def test_create_reservation_blocks_slot(client: TestClient, db_session: Session, slot: TimeSlot) -> None:
    response = reserve(client, slot)

    assert response.status_code == 201
    summary = response.json()
    assert summary["slot_id"] == slot.id
    assert summary["game_id"] == slot.game_id
    assert summary["organizer_id"] == "organizer-1"
    assert summary["participant_count"] == 4
    assert summary["total_cost"] == 200.0
    assert summary["status"] == "unpaid"
    assert summary["is_paid"] is False
    db_session.refresh(slot)
    assert slot.is_available is False


def test_create_reservation_on_taken_slot_returns_409(client: TestClient, slot: TimeSlot) -> None:
    assert reserve(client, slot).status_code == 201

    response = reserve(client, slot, params=OTHER_USER)

    assert response.status_code == 409
    assert "zarezerwowany" in response.json()["detail"]


def test_slot_taken_by_parallel_request_returns_409(
    client: TestClient, db_session: Session, slot: TimeSlot
) -> None:
    """Symulacja wyścigu: sesja widzi termin jako wolny, ale w bazie ktoś go już zajął."""
    db_session.get(TimeSlot, slot.id)  # termin w pamięci sesji: is_available=True
    db_session.connection().exec_driver_sql("UPDATE time_slots SET is_available = 0 WHERE id = ?", (slot.id,))

    response = reserve(client, slot)

    assert response.status_code == 409
    assert db_session.scalars(select(Reservation)).all() == []


def test_create_reservation_unknown_slot_returns_404(client: TestClient, slot: TimeSlot) -> None:
    response = client.post(URL, params=ORGANIZER, json={"slot_id": "brak", "participant_count": 2})

    assert response.status_code == 404


@pytest.mark.parametrize("count", [1, 7])
def test_create_reservation_participants_out_of_game_range_returns_400(
    client: TestClient, slot: TimeSlot, count: int
) -> None:
    response = reserve(client, slot, count=count)

    assert response.status_code == 400
    assert "2-6" in response.json()["detail"]


def test_create_reservation_invalid_body_returns_422(client: TestClient, slot: TimeSlot) -> None:
    response = reserve(client, slot, count=0)

    assert response.status_code == 422


def test_create_reservation_without_user_returns_422(client: TestClient, slot: TimeSlot) -> None:
    response = reserve(client, slot, params={})

    assert response.status_code == 422


def test_cancel_unpaid_reservation_frees_slot(client: TestClient, db_session: Session, slot: TimeSlot) -> None:
    reservation_id = reserve(client, slot).json()["reservation_id"]

    response = client.delete(f"{URL}/{reservation_id}", params=ORGANIZER)

    assert response.status_code == 200
    assert response.json() is True
    db_session.expire_all()
    assert db_session.get(TimeSlot, slot.id).is_available is True
    assert db_session.get(Reservation, reservation_id).status is ReservationStatus.CANCELLED
    assert reserve(client, slot, params=OTHER_USER).status_code == 201


def test_cancel_unknown_reservation_returns_404(client: TestClient) -> None:
    assert client.delete(f"{URL}/brak", params=ORGANIZER).status_code == 404


def test_cancel_someone_elses_reservation_returns_403(
    client: TestClient, db_session: Session, slot: TimeSlot
) -> None:
    reservation_id = reserve(client, slot).json()["reservation_id"]

    response = client.delete(f"{URL}/{reservation_id}", params=OTHER_USER)

    assert response.status_code == 403
    db_session.expire_all()
    assert db_session.get(Reservation, reservation_id).status is ReservationStatus.UNPAID


def test_payment_confirms_reservation_and_sends_inbox_message(
    client: TestClient, db_session: Session, slot: TimeSlot
) -> None:
    reservation_id = reserve(client, slot).json()["reservation_id"]

    response = client.post(f"{URL}/{reservation_id}/payment", params=ORGANIZER)

    assert response.status_code == 200
    assert response.json()["status"] == "confirmed"
    assert response.json()["is_paid"] is True
    payment = db_session.scalars(select(Payment)).one()
    assert payment.amount == 200.0
    message = db_session.scalars(select(Message)).one()
    assert message.recipient_id == "organizer-1"
    assert "Noc w muzeum" in message.content
    assert "2026-11-14 18:00" in message.content


def test_payment_of_unknown_reservation_returns_404(client: TestClient) -> None:
    assert client.post(f"{URL}/brak/payment", params=ORGANIZER).status_code == 404


def test_payment_of_someone_elses_reservation_returns_403(
    client: TestClient, db_session: Session, slot: TimeSlot
) -> None:
    reservation_id = reserve(client, slot).json()["reservation_id"]

    response = client.post(f"{URL}/{reservation_id}/payment", params=OTHER_USER)

    assert response.status_code == 403
    assert db_session.scalars(select(Payment)).all() == []


def test_double_payment_returns_409(client: TestClient, slot: TimeSlot) -> None:
    reservation_id = reserve(client, slot).json()["reservation_id"]
    assert client.post(f"{URL}/{reservation_id}/payment", params=ORGANIZER).status_code == 200

    assert client.post(f"{URL}/{reservation_id}/payment", params=ORGANIZER).status_code == 409


def test_cancelled_reservation_cannot_be_paid(client: TestClient, slot: TimeSlot) -> None:
    reservation_id = reserve(client, slot).json()["reservation_id"]
    client.delete(f"{URL}/{reservation_id}", params=ORGANIZER)

    assert client.post(f"{URL}/{reservation_id}/payment", params=ORGANIZER).status_code == 409


def test_paid_reservation_cannot_be_cancelled(client: TestClient, slot: TimeSlot) -> None:
    reservation_id = reserve(client, slot).json()["reservation_id"]
    client.post(f"{URL}/{reservation_id}/payment", params=ORGANIZER)

    assert client.delete(f"{URL}/{reservation_id}", params=ORGANIZER).status_code == 409
