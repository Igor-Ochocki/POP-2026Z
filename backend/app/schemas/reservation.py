from pydantic import BaseModel, Field

from app.models.enums import ReservationStatus


class ReservationCreateSchema(BaseModel):
    """Nowa rezerwacja (PU2) - odpowiada ReservationCreateDTO frontendu."""

    slot_id: str
    game_id: str
    participant_count: int = Field(gt=0)


class ReservationSummarySchema(BaseModel):
    """Podsumowanie rezerwacji (PU2) - odpowiada ReservationSummaryDTO frontendu."""

    reservation_id: str
    slot_id: str
    game_id: str
    organizer_id: str
    participant_count: int
    total_cost: float
    status: ReservationStatus
    is_paid: bool
