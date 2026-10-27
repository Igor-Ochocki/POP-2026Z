@startuml
interface IGamesService <<interface>> {
    +getGames(tags: string[*], limit: number, offset: number): Promise<GameMetadataDTO[*]>
    +getGameTags(): Promise<string[*]>
}

class GamesApiController <<Controller>> {
    +getGames(tags: string[*], limit: number, offset: number): Promise<GameMetadataDTO[*]>
    +getGameTags(): Promise<string[*]>
}

class GamesService implements IGamesService {
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