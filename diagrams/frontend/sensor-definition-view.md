<div hidden>

```
@startuml sensor-definition-view
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 4
skinparam linetype polyline
skinparam nodesep 30
skinparam ranksep 40
hide empty members

title PU50 Zdefiniowanie czujnika - widok

class SensorDefinitionWindows

class SensorDefinitionView <<View>>

class MessageDialog

class DataErrorDialog
class SaveErrorDialog
class SaveSuccessDialog

interface ISensorDefinitionWindows <<interface>>
interface ISensorDefinitionActions <<interface>>
class SensorDefinitionViewModel <<State>>


SensorDefinitionWindows .u.|> ISensorDefinitionWindows
SensorDefinitionWindows --> SensorDefinitionView
SensorDefinitionWindows --> MessageDialog

DataErrorDialog -u-|> MessageDialog
SaveErrorDialog -u-|> MessageDialog
SaveSuccessDialog -u-|> MessageDialog

DataErrorDialog --> ISensorDefinitionActions
SaveErrorDialog --> ISensorDefinitionActions
SaveSuccessDialog --> ISensorDefinitionActions

SensorDefinitionView --> ISensorDefinitionActions
SensorDefinitionView --> SensorDefinitionViewModel

@enduml
```

</div>

![](rendered/sensor-definition-view.svg)
