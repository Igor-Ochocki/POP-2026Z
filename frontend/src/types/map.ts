export interface PositionDTO {
  x: number;
  y: number;
}

export interface PassageDTO {
  id: number;
  room1Id: number;
  room2Id: number;
  position: PositionDTO;
}

export interface RoomDTO {
  id: number;
  name: string;
  width: number;
  description: string;
  height: number;
  position: PositionDTO;
}

export interface MapContainerDTO {
  width: number;
  height: number;
}

export interface GameMapDTO {
  id: number; 
  name: string;
  description: string;
  container: MapContainerDTO;
  rooms: RoomDTO[];
  passages: PassageDTO[];
  isValid: boolean;
}

export interface MapSaveDTO {
  gameId: string;
  userId: string;
  map: GameMapDTO;
}

export type MapEditorDialogTypes =
  | 'mapSaved'
  | 'incorrectMapData'
  | 'saveError'
  | 'browserSaveError';

export interface MapEditorViewModel {
  gameId: string;
  map: GameMapDTO;
  selectedRoomId: number | null;
  selectedPassageId: number | null;
  isAutoSaveEnabled: boolean;
  lastSaveTime: Date | null;
  isSubmitting: boolean;
  dialogType: MapEditorDialogTypes | null;  
  isLoading: boolean;
  isMapMissing: boolean;
  errorMessage: string | null;
}

export interface IMapEditorWindows {
  showMapEditorView(gameId: string): void;
  showMapSavedMessageDialog(): void;
  showIncorrectMapDataMessageDialog(): void;
  showMapSaveErrorMessageDialog(): void;
  showMapSaveBrowserErrorMessageDialog(): void;
  hideDialogs(): void;
}

export interface IMapEditorActions {
  onOpenMapEditor(gameId: string): void;
  onContainerChange(data: Partial<MapContainerDTO>): void;
  onRoomSelected(roomId: number): void;
  onSelectedRoomChange(data: Partial<RoomDTO>): void;
  onPassageSelected(passageId: number): void;
  onSelectedPassageChange(data: Partial<PassageDTO>): void;
  onEditSelectedRoom(): void;
  onSaveAndExit(): void;
  onRetryBrowserSave(): void;
  onContinueWithoutBrowserSave(): void;
  onRetrySystemSave(): void;
  onReturnToEditing(): void;
  onSaveAsInvalid(): void;
  onExitWithoutSaving(): void;
  onAddRoom(): void;
  onRemoveSelectedRoom(): void;
  onAddPassage(room1Id: number, room2Id: number): void;
  onRemoveSelectedPassage(): void;
  onGenerateMap(): void;
}
