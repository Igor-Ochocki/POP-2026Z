"""ORM models. Import every model here so Base.metadata registers it
(create_tables relies on that when bootstrapping the database)."""

from app.models.time_slot import TimeSlot

__all__ = ["TimeSlot"]
