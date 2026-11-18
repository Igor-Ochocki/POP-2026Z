from abc import ABC, abstractmethod

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.events import Event
from app.models.reservation import Reservation
from app.schemas.events import EventSchema
from app.models.enums import EventStatus
from app.core.exceptions import NotFoundError, ConflictError


class IEventsService(ABC):

    @abstractmethod
    def get_event(self, reserv_id: str) -> EventSchema: ...

    @abstractmethod
    def join_event(self, reserv_id: str, user_id: str) -> EventSchema: ...



class EventsService(IEventsService):

    def __init__(self, db_session: Session) -> None:
        self.db_session=db_session

    def get_event(reserv_id: str) -> EventSchema:
        event = self.db_session.get(Event, reserv_id)
        reservation = self.db_session.get(Reservation, reserv_id)

        if event is None:
            raise NotFoundError(f"Event '{reserv_id}' not found")

        if reservation is None:
            raise NotFoundError(f"Reservation '{reserv_id}' not found")

        returned_event = EventSchema(
            reserv_id=reservation.reserv_id,
            users_registered=event.users_registered,
            participants=event.participants,
            slot_id=reservation.slot_id,
            game_id=reservation.game_id,
            participant_count=reservation.participant_count,
            event_status=event.event_status,
        )
        
        return returned_event

    def join_event(reserv_id: str, user_id: str) -> EventSchema:
        self._lock_event()

        event = self.db_session.get(Event, reserv_id)
        reservation = self.db_session.get(Reservation, reserv_id)

        if event is None:
            self.db_session.rollback()
            raise NotFoundError(f"Event '{reserv_id}' not found")
        if event.event_status is EventStatus.FINISHED:              # scenariusz alternatywny B - wydarzenie zakończone 
            self.db_session.rollback()
            raise ConflictError(f"Event '{reserv_id}' is already finished")
        elif event.event_status is EventStatus.CANCELLED:           # scenariusz alternatywny B - wydarzenie odwołane
            self.db_session.rollback()
            raise ConflictError(f"Event '{reserv_id}' has been cancelled")
        elif reservation.participant_count == event.users_registered:   # scenariusz alternatywny A - przekroczony maksymalny limit graczy
            self.db_session.rollback()
            raise ConflictError(f"Event '{reserv_id}' has reached the maximum amount of participants")

        event.users_registered += 1
        event.participants.append(user_id)
        self.db_session.commit()

        returned_event = EventSchema(
            reserv_id=reservation.reserv_id,
            users_registered=event.users_registered,
            participants=event.participants,
            slot_id=reservation.slot_id,
            game_id=reservation.game_id,
            participant_count=reservation.participant_count,
            event_status=event.event_status,
        )

        return returned_event


    def _lock_event(self) -> None:
        """ Blokuje sesję do operacji wymagających podejścia atomowego """
        self.db_session.execute(text("BEGIN IMMEDIATE"))