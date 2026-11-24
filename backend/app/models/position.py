from dataclasses import dataclass


@dataclass
class Position:
    """Wspólny typ położenia (x, y) - kolumny position_x / position_y w tabelach mapy."""

    x: float
    y: float
