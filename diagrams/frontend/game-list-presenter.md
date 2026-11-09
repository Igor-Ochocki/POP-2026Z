```
@startuml
interface IGameListActions <<interface>> {
    +onChangeParameter(field: string, value: any)
    +onFilterSubmit(filterTags: string[*])
    +onListReload()
    +onShowMore()
    +onOpenGameList()
    +onOpenFilterDialog()
}

interface IGamesApi <<interface>> {
    +getGames(tags: string[*], limit: number, offset: number): Promise<GameMetadataDTO[*]>
    +getGameTags(): Promise<string[*]>
}

interface IGameListWindows <<interface>> {
    +showGameListView()
    +showGameFilterDialog()
}

class useGameList {
    +onFilterApply(tags: string[*])
    +onFilterClear()
    +onListReload()
    +onTitleSearch(title: string)
    +onShowMore()
}

class GameListViewModel <<State>> {
    +games: GameMetadataDTO[*]
    +searchString: string
    +filterTags: string[*]
    +appliedtags: string[*]
    +downloadOffset: number
    +filterDialogOpen: boolean
}

useGameList -u-> IGameListWindows
useGameList .|> IGameListActions
useGameList -->  IGamesApi
GameListViewModel *- useGameList

@enduml
```

![](rendered/game-list-presenter.svg)
