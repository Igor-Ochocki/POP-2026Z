from pydantic import BaseModel, Field


class ReservationCreateSchema(BaseModel):
    """Nowa rezerwacja (PU2) - slot zajęty przez organizatora dla gry."""

    slot_id: str
    game_id: str
    participant_count: int = Field(gt=0)


class ReservationSummarySchema(BaseModel):
    """Podsumowanie rezerwacji (PU2) - mapowane na ReservationSummaryDTO frontendu."""

    reservation_id: str
    slot_id: str
    game_id: str
    organizer_id: str
    participant_count: int
    total_cost: float
    status: str
    is_paid: bool
