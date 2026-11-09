"""ORM models (SQLAlchemy).

Import every model here and list it in __all__ - create_tables() only creates
tables for models imported in this file, e.g.:

    from app.models.game import Game
from app.models.message import Message
from app.models.payment import Payment
from app.models.reservation import Reservation
from app.models.time_slot import TimeSlot

    __all__ = ["Game"]
"""
from app.models.actions import Action
from app.models.game import Game
from app.models.time_slot import TimeSlot

__all__: list[str] = [
    "Action", "Game", "Message", "Payment", "Reservation", "TimeSlot"
]
