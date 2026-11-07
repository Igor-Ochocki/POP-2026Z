from fastapi import APIRouter

from app.api.v1.controllers import health_controller
from app.api.v1.controllers import actions_controller

# Register every new controller here.
api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health_controller.router)
api_router.include_router(actions_controller.router)
