<div hidden>

```
@startuml pu25-lista-gier
skinparam shadowing false
skinparam roundcorner 4
skinparam sequenceMessageAlign left
skinparam responseMessageBelowArrow true
skinparam maxMessageSize 260
skinparam ParticipantPadding 8
hide footbox
autonumber

title PU25 Wyświetlenie listy gier przez twórcę - realizacja przypadku użycia (komponenty i interfejsy)

actor "Twórca gry" as U
box "Frontend" #F4F8FF
    participant "CreatorPanelView" as VC <<View>>
    participant "GameListView" as V <<View>>
    participant "IGameListActions" as IA <<interface>>
    participant "useGameList" as P <<Hook>>
    participant "IGameListWindows" as IW <<interface>>
    participant "IGameDefinitionActions" as IG <<interface>>
    participant "IGamesApi" as IAPI <<interface>>
    participant "gamesApi" as API <<API>>
end box
box "Backend (w przygotowaniu)" #FFF8EE
    participant "IGamesApi\n/api/v1/games" as REST <<interface>>
end box

== Otwarcie listy gier ==
U -> VC : "Lista gier"
VC -> IA : onOpenGameList()
IA -> P : onOpenGameList()
P -> IW : showGameListView({appliedTags: []})
IW --> V : /creator/games + dane w nawigacji

par tagi do filtrowania
    P -> IAPI : getGameTags()
    IAPI -> API : getGameTags()
    API -> REST : GET /games/tags
    REST --> API : string[*]
    API --> P : string[*]
else pierwsza strona gier
    P -> IAPI : getGames(userId, [], 10, 0)
    IAPI -> API : getGames(userId, [], 10, 0)
    API -> REST : GET /games?user_id&limit=10&offset=0
    REST --> API : GameResponseSchema[*]
    API --> P : GameMetadataDTO[*]
end

alt dane pobrane
    P --> V : stan: games, filterTags
    V --> U : lista gier twórcy
else błąd pobierania
    P --> V : stan: downloadErrored
    V --> U : "Ups! Mamy problemy z pobraniem danych"
    U -> V : "Spróbuj ponownie"
    V -> IA : onListReload()
    IA -> P : onListReload()
    note right of P : ponowne pobranie tagów i pierwszej strony
end

opt wyszukiwanie po tytule
    U -> V : wpisanie frazy
    V -> IA : onChangeParameter(searchString, value)
    IA -> P : onChangeParameter(searchString, value)
    V --> U : lista zawężona do pasujących tytułów
end

opt filtrowanie po tagach
    U -> V : "Filtruj"
    V -> IA : onOpenFilterDialog()
    IA -> P : onOpenFilterDialog()
    P -> IW : showGameFilterDialog()
    U -> V : wybór tagów, "Zastosuj"
    V -> IA : onFilterSubmit(tags)
    IA -> P : onFilterSubmit(tags)
    P -> IAPI : getGames(userId, tags, 10, 0)
    IAPI -> API : getGames(...)
    API -> REST : GET /games?user_id&tags=..&limit=10&offset=0
    REST --> API : GameResponseSchema[*]
    API --> P : GameMetadataDTO[*]
    V --> U : przefiltrowana lista
end

opt kolejna strona
    U -> V : "Pokaż więcej"
    V -> IA : onShowMore()
    IA -> P : onShowMore()
    P -> IAPI : getGames(userId, appliedTags, 10, games.length)
    IAPI -> API : getGames(...)
    API -> REST : GET /games?user_id&limit=10&offset=n
    REST --> API : GameResponseSchema[*]
    API --> P : GameMetadataDTO[*]
    V --> U : lista z dołączoną stroną
end

opt wybór gry - edycja
    U -> V : kliknięcie gry
    V -> IG : onOpenGame(gameId)
    ref over IG : PU49 Zdefiniowanie gry - definicja wybranej gry
end

note over REST
    Backend PU25 (GET /games, GET /games/tags)
    jest w przygotowaniu.
end note
@enduml
```

</div>

![](rendered/pu25-lista-gier.svg)
