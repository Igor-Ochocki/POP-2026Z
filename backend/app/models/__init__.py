"""ORM models (SQLAlchemy).

Import every model here and list it in __all__ - create_tables() only creates
tables for models imported in this file, e.g.:

    from app.models.game import Game

    __all__ = ["Game"]
"""
from app.models.actions import Action
from app.models.events import Event
from app.models.game import Game
from app.models.inventory_item import InventoryItem
from app.models.map import Map
from app.models.message import Message
from app.models.passage import Passage
from app.models.payment import Payment
from app.models.qr_code import QrCode
from app.models.reservation import Reservation
from app.models.room import Room
from app.models.room_item_claim import RoomItemClaim
from app.models.scenario import Scenario
from app.models.sensor import Sensor
from app.models.task import Task
from app.models.time_slot import TimeSlot
from app.models.victory_condition import VictoryCondition

__all__: list[str] = [
    "Action", "Event", "Game", "InventoryItem", "Map", "Message", "Passage", "Payment", "QrCode",
    "Reservation", "Room", "RoomItemClaim", "Scenario", "Sensor", "Task", "TimeSlot", "VictoryCondition",
]
