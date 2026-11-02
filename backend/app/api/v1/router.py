from fastapi import APIRouter

from app.api.v1.controllers import games_controller
from app.api.v1.controllers import health_controller
from app.api.v1.controllers import actions_controller
from app.api.v1.controllers import calendar_controller

# Register every new controller here.
api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health_controller.router)
api_router.include_router(games_controller.router)
api_router.include_router(actions_controller.router)
api_router.include_router(calendar_controller.router)
