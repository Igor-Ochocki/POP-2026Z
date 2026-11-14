<div hidden>

```
@startuml map-editor-presenter
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU60 Definicja mapy - prezenter

interface IMapEditorActions <<interface>> {
    + onRoomSelected(roomId: int)
    + onSelectedRoomChange(data: Partial<RoomDTO>)
    + onPassageSelected(passageId: int)
    + onSelectedPassageChange(data: Partial<PassageDTO>)
    + onEditSelectedRoom()
    + onSaveAndExit()
    + onRetryBrowserSave()
    + onContinueWithoutBrowserSave()
    + onRetrySystemSave()
    + onReturnToEditing()
    + onSaveAsInvalid()
    + onExitWithoutSaving()
}

interface IRoomEditActions <<interface>> {
    + onOpenRoomEditor(roomId: int, width: number, height: number)
}

interface IMapEditorWindows <<interface>> {
    + showMapEditorView(gameId: string)
    + showMapSavedMessageDialog()
    + showIncorrectMapDataMessageDialog()
    + showMapSaveErrorMessageDialog()
    + showMapSaveBrowserErrorMessageDialog()
    + hideDialogs()
}

class useMapEditor <<Hook>> {
    - handleAutoSaveLocally(map: GameMapDTO)
    - saveMapToSystem(map: GameMapDTO)
    - validateMap(map: GameMapDTO)
}

class MapEditorViewModel <<State>> {
    + gameId: string
    + map: GameMapDTO
    + selectedRoomId: int | null
    + selectedPassageId: int | null
    + isAutoSaveEnabled: boolean
    + lastSaveTime: Date | null
    + isSubmitting: boolean
    + dialogType: MapEditorDialogTypes | null
}

class GameMapDTO <<DTO>> {
    + container: MapContainerDTO
    + chambers: RoomDTO[]
    + passages: PassageDTO[]
    + isValid: boolean
}

class MapContainerDTO <<DTO>> {
    + width: number
    + height: number
}

class RoomDTO <<DTO>> {
    + id: int
    + name: string
    + width: number
    + height: number
    + position: PositionDTO
}

class PassageDTO <<DTO>> {
    + id: int
    + Room1Id: int
    + Room2Id: int
}

class PositionDTO <<DTO>> {
    + x: number
    + y: number
}

enum MapEditorDialogTypes {
    mapSaved
    incorrectMapData
    saveError
    browserSaveError
}

interface IMapsApi <<interface>> {

}

interface IMapDraftStorage <<interface>> {

}

class MapSaveDTO <<DTO>>

useMapEditor .u.|> IMapEditorActions
useMapEditor -u-> IMapEditorWindows
useMapEditor --> IRoomEditActions
useMapEditor *-- "1" MapEditorViewModel : state
MapEditorViewModel *-- "1" GameMapDTO : map
GameMapDTO *-- "1" MapContainerDTO
GameMapDTO *-- "*" RoomDTO
GameMapDTO *-- "*" PassageDTO
RoomDTO *-- "1" PositionDTO
MapEditorViewModel ..> MapEditorDialogTypes
useMapEditor ..> MapSaveDTO
useMapEditor --> IMapsApi
useMapEditor --> IMapDraftStorage


@enduml

```

<\div>

![](rendered/map-editor-presenter.svg)
