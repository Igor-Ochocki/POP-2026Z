import type { ActionDTO } from '@/types/action.ts';
import type { GameMapDTO, PositionDTO } from '@/types/map.ts';

export interface SensorDTO {
  type: string;
  action: string;
  position: PositionDTO;
}

export interface SensorDefinitionViewModel {
  gameId: string;
  roomId: string;
  sensorTypes: string[];
  actions: ActionDTO[];
  gameMap: GameMapDTO;
  selectedPosition: PositionDTO | null;
  selectedAction: string;
  selectedType: string;
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
  onCreateSensor(gameId: string): void;
  onOpenPositionSelector(): void;
  onSensorSubmit(): void;
  onCreateSensorCancel(): void;
}
