from abc import ABC, abstractmethod
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.events import EventSchema
from app.services.events_service import IEventsService, EventsService

from app.db.database import get_db



class IEventsApi(ABC):
    @abstractmethod
    def get_event(self, reserv_id: str) -> EventSchema: ... 

    @abstractmethod
    def join_event(self, reserv_id: str, user_id: str) -> EventSchema: ...




router = APIRouter(prefix="/events", tags=["events"])


def get_events_service(db: Annotated[Session, Depends(get_db)]) -> IEventsService:
    return EventsService(db)

EventsServiceDep = Annotated[IEventsService, Depends(get_events_service)]


@router.get("/{reserv_id}", response_model=EventSchema)
def get_event(reserv_id: str, service: EventsServiceDep) -> EventSchema:
    return service.get_event(reserv_id)

@router.put("/{reserv_id}", response_model=EventSchema)
def join_event(reserv_id: str, user_id: str, service: EventsServiceDep) -> EventSchema:
    return service.join_event(reserv_id, user_id)