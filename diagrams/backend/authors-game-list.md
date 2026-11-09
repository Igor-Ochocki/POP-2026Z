```plantuml
@startuml
interface GamesApi <<interface>>\n<< /api/v1/games >> {
    + <<GET /authored >>\n\tget_games(tags: string[*], limit: number, offset: number): Promise<GameMetadataDTO[*]>
    + <<GET /tags >>\n\tget_tags(): Promise<string[*]>
}

class GamesApiController <<Controller>> implements GamesApi {
    -games_service: IGamesService

    +getAuthoredGames(tags: string[*], limit: number, offset: number): Promise<GameMetadataDTO[*]>
    +getGameTags(): Promise<string[*]>
}

class GamesService implements IGamesService {
    - auth_service: IAuthService

    +getAuthoredGames(tags: string[*], limit: number, offset: number): Promise<GameMetadataDTO[*]>
    +getGameTags(): Promise<string[*]>
}

interface IAuthService {
    + getCurrentUser(): User
}

class AuthService implements IAuthService {
    + getCurrentUser(): User
}


package "Models (Db)" as models {

    class Game <<BaseModel>> {
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
    
    class User <<Base>> {
        + created_games: list[Game]
    }
}

interface IGamesService <<interface>> {
    +getAuthoredGames(tags: string[*], limit: number, offset: number): Promise<GameMetadataDTO[*]>
    +getGameTags(): Promise<string[*]>
}

package "Enums"{
    enum GameStatus {
        Draft
        Submitted
        Rejected
        Approved
    }
}

package "Schemas" {
    class GameMetadataDTO <<BaseModel>> {
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

GamesApiController --> IGamesService
User -> Game
Game --> GameStatus
GamesApiController -> GameMetadataDTO
IGamesService -> GameMetadataDTO
GamesService -> GameMetadataDTO
GamesService --> IAuthService
GamesService --> User
AuthService --> User
GamesService --> Game

@enduml
```

![](./rendered/authors-game-list.svg)