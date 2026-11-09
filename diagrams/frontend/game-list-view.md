```
@startuml

interface IGameListWindows <<interface>> {
    +showGameListView()
    +showGameFilterDialog()
}

interface IGameListActions <<interface>> {
    +onChangeParameter(field: string, value: any)
    +onFilterSubmit(filterTags: string[*])
    +onListReload()
    +onShowMore()
    +onOpenGameList()
    +onOpenFilterDialog()
}

class GameListWindows {
    +showGameListView()
    +showGameFilterView()
}

class GameListView {
    +show()
    +onClick()
}

class GameFilterView {
    +show()
    +onClick()
}

GameListWindows ..|> IGameListWindows
GameListWindows -u-> GameListView
GameListWindows -u-> GameFilterView

GameListView --> IGameListActions
GameFilterView --> IGameListActions

@enduml
```

![](rendered/game-list-view.svg)
