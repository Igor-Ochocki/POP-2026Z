from enum import StrEnum

class ActionType(StrEnum):
    MINI_GAME = "miniGame"
    MOVEMENT = "movement"
    ATTACK = "attack"
    USE_ITEM = "useItem"
    DIALOGUE = "dialogue"
    CUSTOM = "custom"

class EffectKind(StrEnum):
    CHANGE_STAT = "changeStat"
    ADD_ITEM = "addItem"
    REMOVE_ITEM = "removeItem"
    CHANGE_LOCATION = "changeLocation"
    SET_FLAG = "setFlag"
    START_MINI_GAME = "startMiniGame"


class ReservationStatus(StrEnum):
    UNPAID = "unpaid"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class PaymentStatus(StrEnum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
