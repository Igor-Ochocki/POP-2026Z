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

export interface InventoryItemDTO {
  itemId: string;
  name: string;
}

export interface SensorDTO {
  position: PositionDTO;
}

export interface QrCodeDTO {
  position: PositionDTO;
}

// Zone name - the diagrams do not define a separate type for it.
export type AccessRestriction = string;

export interface RoomDTO {
  id: number;
  name: string;
  description: string;
  hidden: boolean;
  zone: AccessRestriction;
  position: PositionDTO;
  width: number;
  height: number;
  passages: PassageDTO[];
  items: InventoryItemDTO[];
  sensors: SensorDTO[];
  qrCodes: QrCodeDTO[];
}

export const RoomEditDialogTypes = {
  roomSaved: 'roomSaved',
  missingInventoryItem: 'missingInventoryItem',
  loadError: 'loadError',
  saveError: 'saveError',
} as const;

export type RoomEditDialogTypes =
  (typeof RoomEditDialogTypes)[keyof typeof RoomEditDialogTypes];

export interface RoomEditViewModel {
  gameId: string | null;
  room: RoomDTO | null;
  sensors: SensorDTO[];
  qrCodes: QrCodeDTO[];
  availableItems: InventoryItemDTO[];
  isLoading: boolean;
  isSaving: boolean;
  dialogType: RoomEditDialogTypes | null;
}

export type RoomDataValue =
  string | boolean | AccessRestriction | InventoryItemDTO[] | PositionDTO[];

export interface IRoomEditActions {
  onEditRoom(gameId: string, roomId: number): void;
  onChangeRoomData(field: string, value: RoomDataValue): void;
  onSaveChanges(): void;
  onRoomSavedMessageDialogConfirm(): void;
  onMissingInventoryItemMessageDialogConfirm(): void;
  onRoomLoadErrorMessageDialogConfirm(): void;
  onRoomSaveErrorMessageDialogConfirm(): void;
}

export interface IRoomEditWindows {
  showRoomEditView(gameId: string, roomId: number): void;
  showRoomSavedMessageDialog(): void;
  showMissingInventoryItemMessageDialog(): void;
  showRoomLoadErrorMessageDialog(): void;
  showRoomSaveErrorMessageDialog(): void;
}
