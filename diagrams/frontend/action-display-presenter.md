@startuml
skinparam classAttributeIconSize 0
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU62 Wyświetlenie akcji - prezenter

interface actions as "IDisplayActionsActions" <<interface>> {
    onDisplayActionsSelect()
}
interface windows as "IDisplayActionsWindows" <<interface>> {
    showDisplayActionsView()
}
class hook as "useDisplayActions" <<Hook>> {
    onDisplayActionsSelect()
}
class vm as "DisplayActionsViewModel" <<State>> {}
interface api as "IActionsApi" <<interface>> {}

hook .|> actions
hook -u-> windows
hook *-- "1" vm : state
hook --> api

note bottom of api
GET /list/{game_id}
end note
@enduml
