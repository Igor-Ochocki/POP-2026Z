"""Przykładowe dane, żeby kalendarz (PU1) i rezerwacja (PU2) nie były puste.

Wywoływane przy starcie aplikacji - dodaje dane tylko wtedy, gdy tabela
time_slots jest pusta, więc nie nadpisuje niczego istniejącego.
"""

from datetime import date, datetime, time, timedelta

from sqlalchemy import Engine, exists, select
from sqlalchemy.orm import Session

from app.models.game import Game, GameStatus
from app.models.time_slot import TimeSlot

SEED_AUTHOR_ID = "seed-author"

SEED_GAMES = [
    {
        "title": "Zagadka Starej Biblioteki",
        "description": "Escape room w zabytkowej bibliotece - odnajdź zaginiony manuskrypt.",
        "min_players": 2,
        "max_players": 6,
        "duration_minutes": 60,
        "tags": ["escape room", "zagadki"],
        "location": "Pokój Biblioteka, ul. Nowowiejska 15",
        "base_price": 45.0,
    },
    {
        "title": "Miejska Gra Detektywistyczna",
        "description": "Rozwiąż sprawę kryminalną, przemierzając ulice Starego Miasta.",
        "min_players": 3,
        "max_players": 10,
        "duration_minutes": 120,
        "tags": ["gra miejska", "detektyw"],
        "location": "Start: Plac Zamkowy",
        "base_price": 35.0,
    },
    {
        "title": "Ucieczka z Laboratorium",
        "description": "Naukowa przygoda - zatrzymaj eksperyment, zanim wymknie się spod kontroli.",
        "min_players": 2,
        "max_players": 5,
        "duration_minutes": 75,
        "tags": ["escape room", "sci-fi"],
        "location": "Pokój Laboratorium, ul. Nowowiejska 15",
        "base_price": 50.0,
    },
]

# (dzień względem dziś, godzina, indeks gry)
SLOT_PLAN = [
    (1, 17, 0),
    (2, 18, 2),
    (3, 16, 1),
    (5, 19, 0),
    (6, 12, 1),
    (6, 17, 2),
    (8, 18, 0),
    (10, 16, 2),
    (12, 11, 1),
    (13, 18, 0),
    (15, 17, 2),
    (17, 19, 0),
    (20, 12, 1),
    (22, 18, 2),
    (25, 17, 0),
    (28, 16, 1),
    (32, 18, 2),
    (36, 17, 0),
    (40, 12, 1),
    (45, 18, 2),
]


def seed_database(bind: Engine, today: date | None = None) -> bool:
    """Dodaje przykładowe gry i terminy, jeśli nie ma żadnych terminów.

    Zwraca True, gdy dane zostały dodane.
    """
    today = today or date.today()
    with Session(bind) as session:
        if session.scalar(select(exists().where(TimeSlot.id.is_not(None)))):
            return False

        games = []
        for data in SEED_GAMES:
            game_data = {k: v for k, v in data.items() if k not in ("location", "base_price")}
            game = Game(author_id=SEED_AUTHOR_ID, status=GameStatus.Approved, **game_data)
            session.add(game)
            games.append((game, data["location"], data["base_price"]))
        session.flush()

        for day_offset, hour, game_index in SLOT_PLAN:
            game, location, base_price = games[game_index]
            session.add(
                TimeSlot(
                    game_id=game.id,
                    start_time=datetime.combine(today + timedelta(days=day_offset), time(hour)),
                    location=location,
                    base_price=base_price,
                )
            )
        session.commit()
        return True
