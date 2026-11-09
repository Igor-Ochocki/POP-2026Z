<div hidden>

```

@startuml game-definition-backend
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam nodesep 26
skinparam ranksep 34
skinparam linetype polyline

title PU49 Zdefiniowanie gry - backend

interface GamesApi <<interface>>\n<< /api/v1/games >> {
    + <<GET /{id} >>\n\tget_game(game_id: str, user_id: str): GameResponseSchema
    + <<POST / >>\n\tsave_game(user_id: str, dto: GameCreateSchema, as_draft: bool): GameResponseSchema
    + <<PUT /{id} >>\n\tedit_game(game_id: str, user_id: str, dto: GameCreateSchema, as_draft: bool): GameResponseSchema
    + <<POST /{id}/submit >>\n\tsubmit_to_reviewer(game_id: str, user_id: str): bool
}

note right of GamesApi {
    user_id używany do sprawdzenia
    czy użytkownik ma dostęp do zasobu
    lub przypisania go jako autora
}

class GamesController <<Controller>> {
    - games_service: IGamesService
    + get_game(game_id: str, user_id: str): GameResponseSchema
    + save_game(user_id: str, dto: GameCreateSchema, as_draft: bool): GameResponseSchema
    + edit_game(game_id: str, user_id: str, dto: GameCreateSchema, as_draft: bool): GameResponseSchema
    + submit_to_reviewer(game_id: str, user_id: str): bool
}

interface IGamesService <<interface>> {
    + get_game(game_id: str, user_id: str): GameResponseSchema
    + save_game(user_id: str, dto: GameCreateSchema, as_draft: bool): GameResponseSchema
    + edit_game(game_id: str, user_id: str, dto: GameCreateSchema, as_draft: bool): GameResponseSchema
    + submit_to_reviewer(game_id: str, user_id: str): bool
}

class GamesService {
    - db_session: Session
    + get_game(game_id: str, user_id: str): GameResponseSchema
    + save_game(user_id: str, dto: GameCreateSchema, as_draft: bool): GameResponseSchema
    + edit_game(game_id: str, user_id: str, dto: GameCreateSchema, as_draft: bool): GameResponseSchema
    + submit_to_reviewer(game_id: str, user_id: str): bool
}

package "Schemas" {
    class GameCreateSchema <<BaseModel>> {
        + title: str
        + description: str
        + min_players: int
        + max_players: int
        + duration_minutes: int
        + requires_invitation: bool
        + tags: list[str]
    }
    
    class GameResponseSchema <<BaseModel>> {
        + game_id: str
        + title: str
        + description: str
        + min_players: int
        + max_players: int
        + duration_minutes: int
        + requires_invitation: bool
        + tags: list[str]
        + status: str
    }
}

package "Models (Db)" as models {
    class Game <<Base>> {
        + id: str
        + title: str
        + description: str
        + min_players: int
        + max_players: int
        + duration_minutes: int
        + requires_invitation: bool
        + tags: list[str]
        + status: GameStatus
        + author_id: str
    }
}

package "Enums"{
    enum GameStatus {
        Draft
        Submitted
        Rejected
        Approved
    }
    
    enum GameCategory {
        Fantasy
        Science Fiction
        Historyczna
        Kryminalna
        Horror
        Przygodowa
    }
    
    note right of GameCategory
        Kategoria jest zapisywana
        jako pierwszy element: tags[0]
    end note
}

GamesService .up.|> IGamesService
GamesController .up.|> GamesApi

GamesService -right-> Game

GamesController --> IGamesService

```

</div>

![](rendered/game-definition.svg)
