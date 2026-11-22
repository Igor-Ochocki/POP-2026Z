import type {
  ISensorDefinitionWindows,
  SensorDefinitionActions,
  SensorDefinitionViewModel,
} from '@/types/sensor.ts';
import { useState } from 'react';
import { type NavigateFunction, useNavigate } from 'react-router';
import { apiClient } from '@api/apiClient.ts';

const SENSOR_DEFINITION_PATH = '/creator/games/sensor';

type SetState = React.Dispatch<React.SetStateAction<SensorDefinitionViewModel>>;

const initialState: SensorDefinitionViewModel = {
  actions: [],
  gameId: 0,
  roomId: 0,
  selectedPosition: null,
  gameMap: {
    container: {
      width: 800,
      height: 600,
    },
    rooms: [
      {
        id: 0,
        name: 'maslo',
        width: 800,
        height: 600,
        position: {
          x: 0,
          y: 0,
        },
        passages: [
          {
            id: 0,
            room1Id: 0,
            room2Id: 1,
            position: {
              x: 0,
              y: 300,
            },
          },
        ],
      },
      {
        id: 1,
        name: 'kaslo',
        width: 800,
        height: 600,
        position: {
          x: 0,
          y: 0,
        },
        passages: [
          {
            id: 0,
            room1Id: 0,
            room2Id: 1,
            position: {
              x: 0,
              y: 300,
            },
          },
        ],
      },
    ],
    isValid: false,
  },
  sensorTypes: [],
  positionSelectorOpen: false,
  dataErrorDialogOpen: false,
  saveErrorDialogOpen: false,
  saveSuccessDialogOpen: false,
};

async function loadSensorTypes(setState: SetState) {
  try {
    const sensorTypes = await apiClient.sensors.getSensorTypes();
    setState((prev) => ({ ...prev, sensorTypes }));
  } catch {
    setState((prev) => ({ ...prev, sensorTypes: ["default"] }));
  }
}

async function loadActions(setState: SetState) {
  setState((prev) => ({ ...prev, actions:[] }));
  return new Promise(() => {})
}

function validateSensorData() {

}
async function loadGameMap(gameId: number, setState: SetState) {

}

function createSensorDefinitionWindows(setState: SetState, navigate: NavigateFunction): ISensorDefinitionWindows {
  return {
    showDataErrorDialog(): void {setState((prev)=>({...prev, dataErrorDialogOpen: true}))},
    showSaveErrorDialog(): void {setState((prev)=>({...prev, saveErrorDialogOpen: true}))},
    showSaveSuccessDialog(): void {setState((prev)=>({...prev, saveSuccessDialogOpen: true}))},
    showSensorPositionSelector(): void {setState((prev) => ({...prev, positionSelectorOpen: true}))},
    showSensorDefinitionView(): void {navigate(SENSOR_DEFINITION_PATH)}
  }
}

export function useSensorDefinition(

): {state: SensorDefinitionViewModel, actions: SensorDefinitionActions} {
  const navigate = useNavigate();
  const [state, setState] = useState<SensorDefinitionViewModel>(initialState);
  const windows = createSensorDefinitionWindows(setState, navigate);
  return {
    state,
    actions: {
      onChangeParameter: (field: string, value: any) =>
        setState((prev) => ({ ...prev, [field]: value })),
      onCreateSensor: (gameId: number, roomId: number) => {
        setState((prev) => ({ ...prev, gameId, roomId }));
        Promise.all([loadSensorTypes(setState), loadActions(setState)]).then(
          windows.showSensorDefinitionView,
        );
      },
      onOpenPositionSelector: () => {
        setState((prev) => ({ ...prev, positionSelectorOpen: true }));
        loadGameMap(state.gameId, setState).then(
          windows.showSensorPositionSelector,
        );
      },
      onSensorSubmit: () => {},
    },
  };
}