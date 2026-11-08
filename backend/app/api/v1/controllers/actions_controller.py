from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.actions import ActionSchema, ActionCreateSchema
from app.services.actions_service import ActionsService, IActionsService

from app.db.database import get_db

router = APIRouter(prefix="/actions", tags=["actions"])


def get_actions_service(db: Annotated[Session, Depends(get_db)]) -> IActionsService:
    return ActionsService(db)

ActionsServiceDep = Annotated[IActionsService, Depends(get_actions_service)]


@router.post("", response_model=ActionSchema, status_code=201)
def create_action(metadata: ActionCreateSchema, service: ActionsServiceDep) -> ActionSchema:
    return service.create_action(metadata)


@router.get("/action_types", response_model=list[str])
def get_action_types(service: ActionsServiceDep) -> list[str]:
    return service.get_action_types()


@router.get("/effect_kind", response_model=list[str])
def get_effect_kind(service: ActionsServiceDep) -> list[str]:
    return service.get_effect_kind()


@router.get("/{action_id}", response_model=ActionSchema)
def get_action(action_id: str, service: ActionsServiceDep) -> ActionSchema:
    return service.get_action(action_id)

