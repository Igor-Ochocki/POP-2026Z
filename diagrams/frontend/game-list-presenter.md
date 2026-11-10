<div hidden>

```
@startuml game-list-presenter
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU25 Wyświetlenie listy gier przez twórcę - presenter

interface IGameListActions <<interface>> {
    + onOpenGameList()
    + onChangeParameter(field: string, value: any)
    + onOpenFilterDialog()
    + onFilterSubmit(filterTags: string[*])
    + onListReload()
    + onShowMore()
}

interface IGameListWindows <<interface>> {
    + showGameListView(navigationState: GameListNavigationState)
    + showGameFilterDialog()
}

class useGameList <<Hook>> {
    - loadGames(tags: string[*], offset: number)
    - loadTags()
}

class GameListViewModel <<State>> {
    + games: GameMetadataDTO[*]
    + searchString: string
    + filterTags: string[*]
    + appliedTags: string[*]
    + downloadOffset: number
    + hasMoreGames: boolean
    + downloadErrored: boolean
    + filterDialogOpen: boolean
}

class GameListNavigationState {
    + appliedTags: string[*]
}

interface IGamesApi <<interface>>
class GameMetadataDTO <<DTO>>

useGameList .u.|> IGameListActions
useGameList -u-> IGameListWindows
useGameList *-- "1" GameListViewModel : state
useGameList ..> GameListNavigationState
GameListViewModel ..> GameMetadataDTO : games
useGameList --> IGamesApi : apiClient.games\ngetGames, getGameTags

note right of useGameList
    onOpenGameList przekazuje GameListNavigationState w nawigacji.
    Gry i tagi są pobierane tylko, gdy widok listy otrzymał te dane,
    więc widoki innych PU wołające onOpenGameList nie wywołują API.
    Strony po 10 gier, "Pokaż więcej" dociąga kolejną od games.length.
end note

note bottom of IGamesApi
    DTO i porty API: interfaces.md.
    Backend PU25 (GET /games, GET /games/tags): backend/game-list.md.
end note
@enduml
```

</div>

![](rendered/game-list-presenter.svg)
