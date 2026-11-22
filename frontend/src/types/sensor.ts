import type { ActionDTO } from '@/types/action.ts';
import type { GameMapDTO, PositionDTO } from '@/types/map.ts';

export interface SensorDTO {
  type: string;
  action: string;
  position: PositionDTO;
}

export interface SensorDefinitionViewModel {
  gameId: number;
  roomId: number;
  sensorTypes: string[];
  actions: ActionDTO[];
  gameMap: GameMapDTO;
  selectedPosition: PositionDTO | null;
  dataErrorDialogOpen: boolean;
  saveErrorDialogOpen: boolean;
  saveSuccessDialogOpen: boolean;
  positionSelectorOpen: boolean;
}

export interface ISensorDefinitionWindows {
  showSensorDefinitionView(): void;
  showSensorPositionSelector(): void;
  showDataErrorDialog(): void;
  showSaveErrorDialog(): void;
  showSaveSuccessDialog(): void;
}

export interface SensorDefinitionActions {
  onChangeParameter(field: string, value: any): void;
  onCreateSensor(gameId: number, roomId: number): void;
  onOpenPositionSelector(): void;
  onSensorSubmit(): void;
}