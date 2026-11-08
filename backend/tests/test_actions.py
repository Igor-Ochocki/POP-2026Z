import logging
import uuid
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import ValidationError
from sqlalchemy import create_engine, event, func, inspect, select, text
from sqlalchemy.exc import IntegrityError, StatementError
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.v1.controllers.actions_controller import router
from app.core.exceptions import ConflictError, NotFoundError, register_exception_handlers
from app.db.database import create_tables, get_db
from app.models import Action, Game
from app.models.enums import ActionType, EffectKind
from app.schemas.actions import ActionCreateSchema, ActionSchema
from app.services.actions_service import ActionsService

NAME_MAX = 100
OUTCOME_VALUE_MAX = 200
GAME_ID_MAX = 36 
ENUM_COLUMN_LENGTH = 50

ACTION_FIELDS = ["game_id", "name", "action_type", "outcome_type", "outcome_value"]

INVALID_FIELD_VALUES = [
    pytest.param("action_type", "banana", id="action_type-unknown-value"),
    pytest.param("action_type", "Attack", id="action_type-wrong-case"),
    pytest.param("action_type", "USE_ITEM", id="action_type-member-name-instead-of-value"),
    pytest.param("action_type", "", id="action_type-empty"),
    pytest.param("outcome_type", "banana", id="outcome_type-unknown-value"),
    pytest.param("outcome_type", "CHANGE_STAT", id="outcome_type-member-name-instead-of-value"),
    pytest.param("name", "", id="name-empty"),
    pytest.param("name", "   ", id="name-whitespace-only"),
    pytest.param("name", None, id="name-null"),
    pytest.param("name", 123, id="name-not-a-string"),
    pytest.param("name", "n" * (NAME_MAX + 1), id="name-too-long"),
    pytest.param("outcome_value", "", id="outcome_value-empty"),
    pytest.param("outcome_value", "   ", id="outcome_value-whitespace-only"),
    pytest.param("outcome_value", "v" * (OUTCOME_VALUE_MAX + 1), id="outcome_value-too-long"),
    pytest.param("game_id", "", id="game_id-empty"),
    pytest.param("game_id", "   ", id="game_id-whitespace-only"),
    pytest.param("game_id", "g" * (GAME_ID_MAX + 1), id="game_id-too-long"),
]

ADVERTISED_VALUES = [
    pytest.param("action_type", member, id=f"action_type-{member.name}") for member in ActionType
] + [
    pytest.param("outcome_type", member, id=f"outcome_type-{member.name}") for member in EffectKind
]




@pytest.fixture()
def engine():

    eng = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(eng, "connect")
    def _enforce_foreign_keys(dbapi_connection, _connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    create_tables(bind=eng)  
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


@pytest.fixture()
def game_id(session_factory):
    with session_factory() as session:
        game = make_game()
        session.add(game)
        session.commit()
        return game.id


def make_game(**overrides) -> Game:
    fields = {
        "author_id": "author-1",
        "title": "Test Game",
        "description": "desc",
        "min_players": 2,
        "max_players": 4,
        "duration_minutes": 60,
    }
    fields.update(overrides)
    return Game(**fields)


def make_payload(**overrides) -> dict:
    payload = {
        "game_id": "game-1",
        "name": "Fireball",
        "action_type": ActionType.ATTACK.value,
        "outcome_type": EffectKind.CHANGE_STAT.value,
        "outcome_value": "hp-10",
    }
    payload.update(overrides)
    return payload


def make_dto(**overrides) -> ActionCreateSchema:
    return ActionCreateSchema(**make_payload(**overrides))


def make_action(**overrides) -> Action:
    fields = {
        "name": "Fireball",
        "action_type": ActionType.ATTACK,
        "outcome_type": EffectKind.CHANGE_STAT,
        "outcome_value": "hp-10",
    }
    fields.update(overrides)
    return Action(**fields)


def count_actions(session_factory) -> int:
    with session_factory() as session:
        return session.scalar(select(func.count()).select_from(Action))




def test_schema_accepts_a_valid_payload_and_converts_strings_to_enums():
    dto = make_dto()

    assert dto.action_type == "attack"
    assert dto.outcome_type == "changeStat"


def test_schema_strips_surrounding_whitespace():
    dto = make_dto(game_id=" g1 ", name="  Fireball  ", outcome_value=" hp-10 ")

    assert (dto.game_id, dto.name, dto.outcome_value) == ("g1", "Fireball", "hp-10")


def test_schema_accepts_values_exactly_at_the_length_limits():
    dto = make_dto(
        game_id="g" * GAME_ID_MAX,
        name="n" * NAME_MAX,
        outcome_value="v" * OUTCOME_VALUE_MAX,
    )

    assert len(dto.game_id) == GAME_ID_MAX
    assert len(dto.name) == NAME_MAX
    assert len(dto.outcome_value) == OUTCOME_VALUE_MAX


@pytest.mark.parametrize(("field", "bad_value"), INVALID_FIELD_VALUES)
def test_schema_rejects_invalid_values(field, bad_value):
    with pytest.raises(ValidationError) as exc_info:
        make_dto(**{field: bad_value})

    assert exc_info.value.errors()[0]["loc"] == (field,)


@pytest.mark.parametrize("field", ACTION_FIELDS)
def test_schema_requires_every_field(field):
    payload = make_payload()
    del payload[field]

    with pytest.raises(ValidationError) as exc_info:
        ActionCreateSchema(**payload)

    error = exc_info.value.errors()[0]
    assert (error["loc"], error["type"]) == ((field,), "missing")


def test_schema_ignores_unknown_fields_so_clients_cannot_choose_the_primary_key():
    dto = make_dto(action_id="my-own-id")

    assert "action_id" not in dto.model_dump()


def test_response_schema_can_be_built_from_an_orm_like_object():
    orm_like = SimpleNamespace(
        action_id="a1",
        game_id="g1",
        name="Fireball",
        action_type=ActionType.ATTACK,
        outcome_type=EffectKind.CHANGE_STAT,
        outcome_value="hp-10",
    )

    schema = ActionSchema.model_validate(orm_like, from_attributes=True)

    assert schema.action_id == "a1"
    assert schema.action_type == "attack"


def test_response_schema_serializes_enums_as_plain_json_strings():
    schema = ActionSchema(
        action_id="a1",
        game_id="g1",
        name="Fireball",
        action_type=ActionType.USE_ITEM,
        outcome_type=EffectKind.ADD_ITEM,
        outcome_value="potion",
    )

    data = schema.model_dump(mode="json")

    assert data["action_type"] == "useItem" and type(data["action_type"]) is str
    assert data["outcome_type"] == "addItem" and type(data["outcome_type"]) is str




def test_create_tables_creates_both_tables(engine):
    assert {"games", "action"} <= set(inspect(engine).get_table_names())


def test_action_table_structure(engine):
    inspector = inspect(engine)
    columns = {column["name"]: column for column in inspector.get_columns("action")}
    expected = ["action_id", "game_id", "name", "action_type", "outcome_type", "outcome_value"]

    assert set(expected) <= set(columns)
    assert all(not columns[name]["nullable"] for name in expected)
    assert columns["name"]["type"].length == NAME_MAX
    assert columns["outcome_value"]["type"].length == OUTCOME_VALUE_MAX
    assert columns["action_type"]["type"].length == ENUM_COLUMN_LENGTH
    assert columns["outcome_type"]["type"].length == ENUM_COLUMN_LENGTH
    assert inspector.get_pk_constraint("action")["constrained_columns"] == ["action_id"]
    assert [
        (fk["constrained_columns"], fk["referred_table"], fk["referred_columns"])
        for fk in inspector.get_foreign_keys("action")
    ] == [(["game_id"], "games", ["id"])]
    assert any(index["column_names"] == ["game_id"] for index in inspector.get_indexes("action"))


def test_models_generate_unique_uuid_primary_keys(session_factory):
    with session_factory() as session:
        games = [make_game(), make_game()]
        session.add_all(games)
        session.flush()
        actions = [make_action(game_id=game.id) for game in games]
        session.add_all(actions)
        session.commit()

        for row in [*games, *actions]:
            primary_key = row.id if isinstance(row, Game) else row.action_id
            assert str(uuid.UUID(primary_key)) == primary_key
        assert games[0].id != games[1].id
        assert actions[0].action_id != actions[1].action_id


def test_enum_columns_store_the_values_not_the_member_names(session_factory, engine, game_id):
    with session_factory() as session:
        session.add(
            make_action(
                game_id=game_id,
                action_type=ActionType.USE_ITEM,
                outcome_type=EffectKind.ADD_ITEM,
            )
        )
        session.commit()

    with engine.connect() as connection:
        stored = connection.execute(text("SELECT action_type, outcome_type FROM action")).one()
    assert tuple(stored) == ("useItem", "addItem")  

    with session_factory() as fresh_session:  
        action = fresh_session.scalars(select(Action)).one()
        assert action.action_type is ActionType.USE_ITEM
        assert action.outcome_type is EffectKind.ADD_ITEM


def test_orm_refuses_to_save_an_unknown_enum_string(session_factory, game_id):
    with session_factory() as session:
        session.add(make_action(game_id=game_id, action_type="banana"))

        with pytest.raises(StatementError) as exc_info:
            session.commit()

    assert isinstance(exc_info.value.orig, LookupError)
    assert "banana" in str(exc_info.value)


def test_relationship_works_in_both_directions(session_factory):
    with session_factory() as session:
        game = make_game()
        action = make_action(game=game)

        assert action in game.actions  

        session.add(game)
        session.commit()

        assert action.game is game
        assert action.game_id == game.id  


def test_database_rejects_an_action_for_a_missing_game(session_factory):
    with session_factory() as session:
        session.add(make_action(game_id="no-such-game"))

        with pytest.raises(IntegrityError):
            session.commit()


def test_deleting_a_game_deletes_only_its_own_actions(session_factory):
    with session_factory() as session:
        doomed, survivor = make_game(), make_game()
        session.add_all([doomed, survivor])
        session.add_all([make_action(game=doomed), make_action(game=survivor)])
        session.commit()

        session.delete(doomed)
        session.commit()

        remaining = session.scalars(select(Action)).all()
        assert [action.game_id for action in remaining] == [survivor.id]




def test_service_create_action_saves_the_row_and_returns_a_schema(db, session_factory, game_id):
    result = ActionsService(db).create_action(make_dto(game_id=game_id))

    assert isinstance(result, ActionSchema)
    assert result.game_id == game_id
    assert len(result.action_id) == 36

    with session_factory() as other_session:  
        saved = other_session.get(Action, result.action_id)
        assert (saved.name, saved.action_type, saved.outcome_type, saved.outcome_value) == (
            "Fireball",
            ActionType.ATTACK,
            EffectKind.CHANGE_STAT,
            "hp-10",
        )


def test_service_create_action_for_an_unknown_game_raises_not_found(db, session_factory):
    with pytest.raises(NotFoundError, match="no-such-game"):
        ActionsService(db).create_action(make_dto(game_id="no-such-game"))

    assert count_actions(session_factory) == 0


def test_service_turns_a_database_constraint_error_into_conflict_and_rolls_back(db, monkeypatch):

    monkeypatch.setattr(Session, "get", lambda self, *args, **kwargs: object())

    
    with pytest.raises(ConflictError):
        ActionsService(db).create_action(make_dto(game_id="vanished-game"))

    assert db.scalar(select(func.count()).select_from(Action)) == 0


def test_service_get_action_returns_the_saved_action(db, game_id):
    service = ActionsService(db)
    created = service.create_action(make_dto(game_id=game_id))

    assert service.get_action(created.action_id) == created


def test_service_get_action_for_an_unknown_id_raises_not_found(db):
    with pytest.raises(NotFoundError, match="nope"):
        ActionsService(db).get_action("nope")


def test_service_lookup_lists_contain_the_enum_values_as_plain_strings():
    action_types = ActionsService.get_action_types()
    effect_kinds = ActionsService.get_effect_kind()

    assert action_types == [member.value for member in ActionType]
    assert effect_kinds == [member.value for member in EffectKind]
    assert all(type(value) is str for value in action_types + effect_kinds)




def test_api_create_action_returns_201_and_the_saved_action(client, game_id, session_factory):
    response = client.post("/actions", json=make_payload(game_id=game_id))

    assert response.status_code == 201
    body = response.json()
    assert set(body) == {"action_id", "game_id", "name", "action_type", "outcome_type", "outcome_value"}
    assert body["game_id"] == game_id
    assert body["name"] == "Fireball"
    assert (body["action_type"], body["outcome_type"], body["outcome_value"]) == (
        "attack",
        "changeStat",
        "hp-10",
    )
    assert count_actions(session_factory) == 1


def test_api_get_action_returns_what_was_created(client, game_id):
    created = client.post("/actions", json=make_payload(game_id=game_id)).json()

    response = client.get(f"/actions/{created['action_id']}")  

    assert response.status_code == 200
    assert response.json() == created


def test_api_create_action_ignores_a_client_supplied_action_id(client, game_id):
    response = client.post("/actions", json=make_payload(game_id=game_id, action_id="my-own-id"))

    assert response.status_code == 201
    assert response.json()["action_id"] != "my-own-id"


def test_api_create_action_for_an_unknown_game_returns_404_and_saves_nothing(client, session_factory):
    response = client.post("/actions", json=make_payload(game_id="no-such-game"))

    assert response.status_code == 404
    assert "no-such-game" in response.json()["detail"]
    assert count_actions(session_factory) == 0


@pytest.mark.parametrize(("field", "bad_value"), INVALID_FIELD_VALUES)
def test_api_create_action_rejects_invalid_input_with_422(client, game_id, session_factory, field, bad_value):
    payload = make_payload(game_id=game_id)
    payload[field] = bad_value

    response = client.post("/actions", json=payload)

    assert response.status_code == 422
    assert count_actions(session_factory) == 0


@pytest.mark.parametrize(
    "request_kwargs",
    [
        pytest.param({}, id="no-body"),
        pytest.param({"json": {}}, id="empty-object"),
        pytest.param({"content": "not json", "headers": {"Content-Type": "application/json"}}, id="malformed-json"),
    ],
)
def test_api_create_action_rejects_a_missing_or_malformed_body_with_422(client, request_kwargs):
    assert client.post("/actions", **request_kwargs).status_code == 422


def test_api_create_action_returns_409_when_the_database_rejects_the_insert(client, session_factory, monkeypatch):
    monkeypatch.setattr(Session, "get", lambda self, *args, **kwargs: object())

    response = client.post("/actions", json=make_payload(game_id="vanished-game"))

    assert response.status_code == 409
    assert response.json()["detail"]
    assert count_actions(session_factory) == 0


def test_api_get_unknown_action_returns_404(client):
    response = client.get("/actions/does-not-exist")

    assert response.status_code == 404
    assert "does-not-exist" in response.json()["detail"]


@pytest.mark.parametrize(
    ("path", "enum_class"),
    [("/actions/action_types", ActionType), ("/actions/effect_kind", EffectKind)],
)
def test_api_lookup_endpoints_list_the_allowed_values(client, path, enum_class):
    response = client.get(path)

    assert response.status_code == 200
    assert response.json() == [member.value for member in enum_class]


@pytest.mark.parametrize(("field", "member"), ADVERTISED_VALUES)
def test_api_accepts_every_value_it_advertises(client, game_id, field, member):
    response = client.post("/actions", json=make_payload(game_id=game_id, **{field: member.value}))

    assert response.status_code == 201
    assert response.json()[field] == member.value
    reloaded = client.get(f"/actions/{response.json()['action_id']}")
    assert reloaded.json()[field] == member.value


def test_api_openapi_documents_the_allowed_enum_values_and_the_201_status(client):
    spec = client.get("/openapi.json").json()
    schemas = spec["components"]["schemas"]

    for schema_name in ("ActionCreateSchema", "ActionSchema"): 
        properties = schemas[schema_name]["properties"]
        assert properties["action_type"]["type"] == "string"
        assert properties["outcome_type"]["type"] == "string"
    assert "201" in spec["paths"]["/actions"]["post"]["responses"]