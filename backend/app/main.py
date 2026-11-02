from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.db.database import create_tables
from app.services.calendar_service import (
    ReservationAlreadyPaidError,
    ReservationNotCancellableError,
    ReservationNotFoundError,
    SlotNotFoundError,
    SlotUnavailableError,
)


def register_domain_error_handlers(application: FastAPI) -> None:
    """Translate service-layer domain errors into HTTP responses."""

    def entity_not_found(_: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    def conflict(_: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    application.add_exception_handler(SlotNotFoundError, entity_not_found)
    application.add_exception_handler(ReservationNotFoundError, entity_not_found)
    application.add_exception_handler(SlotUnavailableError, conflict)
    application.add_exception_handler(ReservationNotCancellableError, conflict)
    application.add_exception_handler(ReservationAlreadyPaidError, conflict)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    create_tables()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(title="POP API", version="0.1.0", lifespan=lifespan)

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.include_router(api_router)
    register_domain_error_handlers(application)
    return application


app = create_app()
