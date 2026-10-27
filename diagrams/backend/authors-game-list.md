@startuml
interface AuthoredGamesApi <<interface>>\n<< /api/v1/authored >> {
    + <<GET /games >>\n\tget_games(tags: string[*], limit: number, offset: number): Promise<GameMetadataDTO[*]>
    + <<GET /tags >>\n/get_tags(): Promise<string[*]>
}

class AuthoredGamesApiController <<Controller>> implements AuthoredGamesApi {
    +getGames(tags: string[*], limit: number, offset: number): Promise<GameMetadataDTO[*]>
    +getGameTags(): Promise<string[*]>
}

class AuthoredGamesService implements IAuthoredGamesService {
    +getGames(tags: string[*], limit: number, offset: number): Promise<GameMetadataDTO[*]>
    +getGameTags(): Promise<string[*]>
}

interface IAuthService {
    + getCurrentUser(): User
}

class AuthService implements IAuthService {
    + getCurrentUser(): User
}


package "Models (Db)" as models {
    class Game <<Base>> {
        + id: str
        + title: str
        + description: str
        + tags: list[str]
        + status: GameStatus
    }
    
    class User <<Base>> {
        + created_games: list[Game]
    }
}

interface IAuthoredGamesService <<interface>> {
    +getGames(tags: string[*], limit: number, offset: number): Promise<GameMetadataDTO[*]>
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
        + tags: list[str]
        + status: str
    }
}

AuthoredGamesApiController --> IAuthoredGamesService
User -> Game
Game --> GameStatus
AuthoredGamesApiController -> GameMetadataDTO
IAuthoredGamesService -> GameMetadataDTO
AuthoredGamesService -> GameMetadataDTO
AuthoredGamesService --> IAuthService
AuthoredGamesService --> User
AuthService --> User
AuthoredGamesService --> Game

@enduml

![Lista gier autora](./rendered/authors-game-list.svg)