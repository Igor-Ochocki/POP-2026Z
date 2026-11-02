import datetime as dt

from pydantic import BaseModel


class CalendarEventSchema(BaseModel):
    """Wydarzenie w kalendarzu (PU1) - odpowiada CalendarEventDTO frontendu."""

    id: str
    title: str
    datetime: dt.datetime
