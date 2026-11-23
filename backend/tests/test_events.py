from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import ValidationError
from sqlalchemy import create_engine, delete, event, inspect, select, text
from sqlalchemy.orm import sessionmaker

import app.models  # noqa: F401
from app.api.v1.controllers.events_controller import router
from app.core.exceptions import ConflictError, NotFoundError, register_exception_handlers
from app.db.database import Base, get_db
from app.models.enums import EventStatus
from app.models.events import Event
from app.models.reservation import Reservation
from app.schemas.events import EventSchema
from app.services.events_service import EventsService
from app.services.reservations_service import ReservationsService

SLOT_ID = "slot-1"
GAME_ID = "game-1"
ORGANIZER_ID = "organizer-1"


@pytest.fixture()
def db_path(tmp_path):
    return str(tmp_path / "events_test.db")


@pytest.fixture()
def engine(db_path):
    eng = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})

    @event.listens_for(eng, "connect")
    def _enforce_foreign_keys_off(dbapi_connection, _connection_record):
        # Testy tworzą wyłącznie Reservation oraz Event bez rekordów Game/TimeSlot.
        dbapi_connection.execute("PRAGMA foreign_keys=OFF")

    Base.metadata.create_all(eng)
    yield eng
    eng.dispose()


@pytest.fixture()
def session_factory(engine):
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


@pytest.fixture()
def db(session_factory):
    with session_factory() as session:
        yield session


@pytest.fixture()
def service(db):
    return EventsService(db)


@pytest.fixture()
def client(session_factory):
    def override_get_db():
        session = session_factory()
        try:
            yield session
        finally:
            session.close()

    app = FastAPI()
    app.include_router(router)
    register_exception_handlers(app)
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client


def make_reservation(**overrides) -> Reservation:
    fields = {
        "slot_id": SLOT_ID,
        "game_id": GAME_ID,
        "organizer_id": ORGANIZER_ID,
        "participant_count": 3,
        "total_cost": 100.0,
    }
    fields.update(overrides)
    return Reservation(**fields)


def make_event_record(
    session_factory,
    participant_count: int = 3,
    participants=(),
    status: EventStatus = EventStatus.OPEN,
) -> str:
    with session_factory() as session:
        reservation = make_reservation(participant_count=participant_count)
        session.add(reservation)
        session.flush()
        reservation_id = reservation.id
        session.add(
            Event(
                reserv_id=reservation_id,
                users_registered=len(participants),
                participants=list(participants),
                event_status=status,
            )
        )
        session.commit()
    return reservation_id


def get_event_state(session_factory, reserv_id: str):
    with session_factory() as session:
        ev = session.scalars(select(Event).where(Event.reserv_id == reserv_id)).one()
        return ev.users_registered, list(ev.participants), ev.event_status


def assert_write_lock_free(engine):
    # Osobne połączenie próbuje otworzyć transakcję zapisu; brak rollbacku po błędzie
    # zablokowałby możliwość zapisu w kolejnych operacjach.
    with engine.connect() as conn:
        conn.exec_driver_sql("BEGIN IMMEDIATE")
        conn.exec_driver_sql("ROLLBACK")


# ================================================================ Schematy


def test_response_schema_can_be_built_from_attributes():
    schema = EventSchema.model_validate(
        {
            "reserv_id": "res-1",
            "users_registered": 1,
            "participants": ["user-1"],
            "slot_id": SLOT_ID,
            "game_id": GAME_ID,
            "participant_count": 4,
            "event_status": EventStatus.OPEN,
        }
    )

    assert schema.reserv_id == "res-1"
    assert schema.users_registered == 1
    assert schema.participants == ["user-1"]
    assert EventStatus(schema.event_status) is EventStatus.OPEN


@pytest.mark.parametrize("missing_field", ["reserv_id", "slot_id", "game_id", "participant_count", "event_status"])
def test_response_schema_requires_mandatory_fields(missing_field):
    payload = {
        "reserv_id": "res-1",
        "users_registered": 0,
        "participants": [],
        "slot_id": SLOT_ID,
        "game_id": GAME_ID,
        "participant_count": 2,
        "event_status": EventStatus.OPEN.value,
    }
    del payload[missing_field]

    with pytest.raises(ValidationError) as exc_info:
        EventSchema(**payload)

    assert exc_info.value.errors()[0]["loc"] == (missing_field,)


# =========================================================== Modele i baza


def test_create_tables_creates_events_and_reservations_tables(engine):
    tables = set(inspect(engine).get_table_names())
    assert "events" in tables
    assert "reservations" in tables


def test_event_table_has_expected_columns(engine):
    columns = {column["name"] for column in inspect(engine).get_columns("events")}
    assert {"reserv_id", "users_registered", "participants", "event_status"} <= columns


def test_event_stores_enum_value_and_reads_enum_member(session_factory, engine):
    reserv_id = make_event_record(session_factory, status=EventStatus.OPEN)

    with engine.connect() as conn:
        raw_status = conn.execute(
            text("SELECT event_status FROM events WHERE reserv_id = :rid"),
            {"rid": reserv_id},
        ).scalar_one()
    assert raw_status == EventStatus.OPEN.name

    _, _, status = get_event_state(session_factory, reserv_id)
    assert status is EventStatus.OPEN


# ================================================================ get_event


def test_get_event_returns_event_and_reservation_data(service, session_factory):
    reserv_id = make_event_record(
        session_factory, participant_count=5, participants=["user-1", "user-2"]
    )

    result = service.get_event(reserv_id)

    assert isinstance(result, EventSchema)
    assert result.reserv_id == reserv_id
    assert result.users_registered == 2
    assert result.participants == ["user-1", "user-2"]
    assert result.slot_id == SLOT_ID
    assert result.game_id == GAME_ID
    assert result.participant_count == 5
    assert EventStatus(result.event_status) is EventStatus.OPEN


def test_get_event_of_new_event_has_no_participants(service, session_factory):
    result = service.get_event(make_event_record(session_factory))

    assert result.users_registered == 0
    assert result.participants == []


@pytest.mark.parametrize("status", list(EventStatus))
def test_get_event_returns_event_status(service, session_factory, status):
    result = service.get_event(make_event_record(session_factory, status=status))

    assert EventStatus(result.event_status) is status


def test_get_event_raises_not_found_for_unknown_event(service):
    with pytest.raises(NotFoundError):
        service.get_event("does-not-exist")



def test_get_event_raises_not_found_when_reservation_is_missing(service, session_factory):
    reserv_id = make_event_record(session_factory)
    with session_factory() as session:
        session.execute(delete(Reservation).where(Reservation.id == reserv_id))
        session.commit()

    with pytest.raises(NotFoundError):
        service.get_event(reserv_id)


# =========================================================== join_event


def test_join_event_adds_user_and_returns_updated_event(service, session_factory, engine):
    reserv_id = make_event_record(session_factory, participant_count=3)

    result = service.join_event(reserv_id, "user-1")

    assert isinstance(result, EventSchema)
    assert result.reserv_id == reserv_id
    assert result.users_registered == 1
    assert result.participants == ["user-1"]
    assert result.slot_id == SLOT_ID
    assert result.game_id == GAME_ID
    assert result.participant_count == 3
    assert EventStatus(result.event_status) is EventStatus.OPEN
    assert get_event_state(session_factory, reserv_id) == (1, ["user-1"], EventStatus.OPEN)
    assert_write_lock_free(engine)


def test_join_event_response_matches_get_event(service, session_factory):
    reserv_id = make_event_record(session_factory)

    assert service.join_event(reserv_id, "user-1") == service.get_event(reserv_id)


def test_join_event_keeps_registration_order(service, session_factory):
    reserv_id = make_event_record(session_factory, participant_count=3)

    for user in ("user-1", "user-2", "user-3"):
        service.join_event(reserv_id, user)

    users_registered, participants, _ = get_event_state(session_factory, reserv_id)
    assert users_registered == 3
    assert participants == ["user-1", "user-2", "user-3"]


def test_join_event_last_free_place_can_be_taken(service, session_factory):
    reserv_id = make_event_record(session_factory, participant_count=2, participants=["user-1"])

    result = service.join_event(reserv_id, "user-2")

    assert result.users_registered == result.participant_count == 2


def test_join_event_raises_not_found_for_unknown_event(service, engine):
    with pytest.raises(NotFoundError):
        service.join_event("does-not-exist", "user-1")

    assert_write_lock_free(engine)


@pytest.mark.parametrize("status", [EventStatus.FINISHED, EventStatus.CANCELLED])
def test_join_event_raises_conflict_when_event_is_not_open(service, session_factory, engine, status):
    reserv_id = make_event_record(session_factory, participant_count=3, status=status)

    with pytest.raises(ConflictError):
        service.join_event(reserv_id, "user-1")

    assert get_event_state(session_factory, reserv_id) == (0, [], status)
    assert_write_lock_free(engine)


def test_join_event_raises_conflict_when_event_is_full(service, session_factory, engine):
    reserv_id = make_event_record(
        session_factory, participant_count=2, participants=["user-1", "user-2"]
    )

    with pytest.raises(ConflictError):
        service.join_event(reserv_id, "user-3")

    assert get_event_state(session_factory, reserv_id) == (2, ["user-1", "user-2"], EventStatus.OPEN)
    assert_write_lock_free(engine)


def test_join_event_rejects_second_registration_of_same_user(service, session_factory, engine):
    reserv_id = make_event_record(session_factory, participant_count=3, participants=["user-1"])

    with pytest.raises(ConflictError):
        service.join_event(reserv_id, "user-1")

    assert get_event_state(session_factory, reserv_id) == (1, ["user-1"], EventStatus.OPEN)
    assert_write_lock_free(engine)


def test_join_event_raises_not_found_when_reservation_is_missing(service, session_factory, engine):
    reserv_id = make_event_record(session_factory)
    with session_factory() as session:
        session.execute(delete(Reservation).where(Reservation.id == reserv_id))
        session.commit()

    with pytest.raises(NotFoundError):
        service.join_event(reserv_id, "user-1")

    assert_write_lock_free(engine)


# ========================================== przepływ: opłacenie -> wydarzenie


def test_event_created_on_payment_can_be_read_and_joined(session_factory):
    payment_stub = SimpleNamespace(process_payment=lambda *args, **kwargs: None)
    message_stub = SimpleNamespace(send_reservation_confirmation=lambda *args, **kwargs: None)

    with session_factory() as session:
        reservation = make_reservation(participant_count=2, total_cost=50.0)
        session.add(reservation)
        session.commit()
        reservation_id = reservation.id

        reservations = ReservationsService(
            session, payment_service=payment_stub, message_service=message_stub
        )
        reservations.mark_payment_completed(ORGANIZER_ID, reservation_id)

        events = EventsService(session)
        created = events.get_event(reservation_id)
        assert EventStatus(created.event_status) is EventStatus.OPEN
        assert created.users_registered == 0
        assert created.participants == []
        assert created.participant_count == 2

        events.join_event(reservation_id, "user-1")
        events.join_event(reservation_id, "user-2")
        with pytest.raises(ConflictError):
            events.join_event(reservation_id, "user-3")


# ======================================================= API


def test_api_get_event_returns_200_and_event_data(client, session_factory):
    reserv_id = make_event_record(session_factory, participant_count=4, participants=["user-1"])

    response = client.get(f"/events/{reserv_id}")

    assert response.status_code == 200
    assert response.json() == {
        "reserv_id": reserv_id,
        "users_registered": 1,
        "participants": ["user-1"],
        "slot_id": SLOT_ID,
        "game_id": GAME_ID,
        "participant_count": 4,
        "event_status": EventStatus.OPEN.value,
    }


def test_api_get_unknown_event_returns_404(client):
    response = client.get("/events/does-not-exist")

    assert response.status_code == 404
    assert "detail" in response.json()


def test_api_join_event_returns_200_and_updated_event(client, session_factory):
    reserv_id = make_event_record(session_factory, participant_count=3)

    response = client.put(f"/events/{reserv_id}", params={"user_id": "user-1"})

    assert response.status_code == 200
    assert response.json()["users_registered"] == 1
    assert response.json()["participants"] == ["user-1"]
    assert client.get(f"/events/{reserv_id}").json()["participants"] == ["user-1"]


def test_api_join_unknown_event_returns_404(client):
    response = client.put("/events/does-not-exist", params={"user_id": "user-1"})

    assert response.status_code == 404
    assert "detail" in response.json()


@pytest.mark.parametrize("status", [EventStatus.FINISHED, EventStatus.CANCELLED])
def test_api_join_event_that_is_not_open_returns_409(client, session_factory, status):
    reserv_id = make_event_record(session_factory, status=status)

    response = client.put(f"/events/{reserv_id}", params={"user_id": "user-1"})

    assert response.status_code == 409
    assert "detail" in response.json()


def test_api_join_full_event_returns_409(client, session_factory):
    reserv_id = make_event_record(session_factory, participant_count=1, participants=["user-1"])

    response = client.put(f"/events/{reserv_id}", params={"user_id": "user-2"})

    assert response.status_code == 409
    assert "detail" in response.json()


def test_api_join_same_event_twice_returns_409(client, session_factory):
    reserv_id = make_event_record(session_factory, participant_count=3)

    first = client.put(f"/events/{reserv_id}", params={"user_id": "user-1"})
    second = client.put(f"/events/{reserv_id}", params={"user_id": "user-1"})

    assert first.status_code == 200
    assert second.status_code == 409
    assert client.get(f"/events/{reserv_id}").json()["participants"] == ["user-1"]


def test_api_join_without_user_id_returns_422(client, session_factory):
    reserv_id = make_event_record(session_factory)

    response = client.put(f"/events/{reserv_id}")

    assert response.status_code == 422