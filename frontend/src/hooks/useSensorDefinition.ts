import type {
  ISensorDefinitionWindows,
  SensorDefinitionActions,
  SensorDefinitionViewModel,
  SensorDTO,
} from '@/types/sensor.ts';
import React, { useState } from 'react';
import { type NavigateFunction, useNavigate, useParams } from 'react-router';
import { apiClient } from '@api/apiClient.ts';
import { useRoomEdit } from './useRoomEdit';
import { env } from '@config/env';

type SetState = React.Dispatch<React.SetStateAction<SensorDefinitionViewModel>>;

const initialState: SensorDefinitionViewModel = {
  actions: [],
  sensorTypes: [],
  gameId: '0',
  roomId: '0',
  selectedPosition: null,
  selectedAction: '',
  selectedType: '',
  gameMap: {
    id: 0,
    name: '',
    description: '',
    container: {
      width: 800,
      height: 600,
    },
    rooms: [],
    passages: [],
    isValid: false,
  },
  positionSelectorOpen: false,
  dataErrorDialogOpen: false,
  saveErrorDialogOpen: false,
  saveSuccessDialogOpen: false,
};

async function loadSensorTypes(setState: SetState) {
  try {
    const sensorTypes = await apiClient.games.getSensorTypes();
    setState((prev) => ({ ...prev, sensorTypes }));
  } catch {
    setState((prev) => ({ ...prev, sensorTypes: ['default'] }));
  }
}

async function loadActions(setState: SetState, gameId: string) {
  const actions = await apiClient.actions.getAll(gameId);
  setState((prev) => ({ ...prev, actions }));
}

async function loadGameMap(setState: SetState, gameId: string) {
  const gameMap = await apiClient.maps.getMap(gameId, env.devUserId);
  setState((prev) => ({ ...prev, gameMap }));
}

function isSensorDataValid(state: SensorDefinitionViewModel): boolean {
  return !(
    state.selectedAction === '' ||
    state.selectedType === '' ||
    state.selectedPosition === null
  );
}

function createSensorDefinitionWindows(
  setState: SetState,
  navigate: NavigateFunction,
  gameId: string,
  roomId: string,
): ISensorDefinitionWindows {
  return {
    showDataErrorDialog(): void {
      setState((prev) => ({ ...prev, dataErrorDialogOpen: true }));
    },
    showSaveErrorDialog(): void {
      setState((prev) => ({ ...prev, saveErrorDialogOpen: true }));
    },
    showSaveSuccessDialog(): void {
      setState((prev) => ({ ...prev, saveSuccessDialogOpen: true }));
    },
    showSensorPositionSelector(): void {
      setState((prev) => ({ ...prev, positionSelectorOpen: true }));
    },
    showSensorDefinitionView(): void {
      navigate(`/creator/games/${gameId}/map/rooms/${roomId}/add-sensor`);
    },
  };
}

export function useSensorDefinition(): {
  state: SensorDefinitionViewModel;
  actions: SensorDefinitionActions;
} {
  var { gameId, roomId } = useParams();
  if (gameId === undefined) {
    throw 'useSensorDefinition used outside of path with no gameId or roomId';
  }
  if (roomId === undefined) {
      roomId = "0"
  }

  const [state, setState] = useState<SensorDefinitionViewModel>({
    ...initialState,
    gameId: gameId,
    roomId: roomId,
  });

  const navigate = useNavigate();
  const windows = createSensorDefinitionWindows(
    setState,
    navigate,
    gameId,
    roomId,
  );

  return {
    state,
    actions: {
      onChangeParameter: (field: string, value: any) =>
        setState((prev) => ({ ...prev, [field]: value })),
      onCreateSensor: (gameId: string) => {
        Promise.all([
          setState({...state, gameId}),
          loadSensorTypes(setState),
          loadActions(setState, gameId),
          loadGameMap(setState, gameId),
        ]).then(windows.showSensorDefinitionView);
      },
      onOpenPositionSelector: () => windows.showSensorPositionSelector(),
      onSensorSubmit: async () => {
        if (!isSensorDataValid(state)) {
          windows.showDataErrorDialog();
          return;
        }
        // @ts-ignore
        let sensor: SensorDTO = {
          action: state.selectedAction,
          position: state.selectedPosition,
          type: state.selectedType,
        };
        apiClient.games
          .addSensor(state.gameId, state.roomId, sensor)
          .then(windows.showSaveSuccessDialog)
          .catch(windows.showSaveErrorDialog);
      },
      onCreateSensorCancel: () => {
        const { actions } = useRoomEdit();
        actions.onEditRoom(state.gameId, Number(state.roomId));
      },
    },
  };
}
