from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Bazowy wyjątek domenowy - mapowany na odpowiedź HTTP przez jeden handler."""

    status_code = 400


class ForbiddenError(AppError):
    """Użytkownik nie ma uprawnień do tego obiektu."""

    status_code = 403


class NotFoundError(AppError):
    """Podany obiekt nie istnieje."""

    status_code = 404


class ConflictError(AppError):
    """Operacja kłóci się z obecnym stanem bazy danych (np. próba nadpisania danych)"""

    status_code = 409


async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": str(exc)})


def register_exception_handlers(application: FastAPI) -> None:
    application.add_exception_handler(AppError, app_error_handler)
