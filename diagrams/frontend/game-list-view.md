<div hidden>

```
@startuml game-list-view
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU25 Wyświetlenie listy gier przez twórcę - widok

class GameListView <<View>> {
    + onSearchChange(value: string)
    + onFilterClick()
    + onShowMoreClick()
    + onRetryClick()
    + onGameClick(gameId: string)
}

class GameFilterDialog <<View>> {
    + onTagToggle(tag: string)
    + onApplyClick()
}

class GameListWindows
interface IGameListWindows <<interface>>
interface IGameListActions <<interface>>
class GameListViewModel <<State>>
interface IGameDefinitionActions <<interface>>

GameListWindows .u.|> IGameListWindows
GameListWindows --> GameListView
GameListWindows --> GameFilterDialog

GameListView --> IGameListActions
GameListView --> GameListViewModel
GameFilterDialog --> IGameListActions : onFilterSubmit
GameListView --> IGameDefinitionActions : onOpenGame (PU49)

note bottom of GameListView
    Wyszukiwanie po tytule filtruje pobrane gry w widoku.
    Wybór gry otwiera jej definicję (PU49).
end note
@enduml
```

</div>

![](rendered/game-list-view.svg)
