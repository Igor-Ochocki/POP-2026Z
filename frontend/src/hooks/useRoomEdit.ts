import { useCallback, useEffect, useRef, useState } from 'react';
import { useMatch, useNavigate, type NavigateFunction } from 'react-router';
import { ApiError } from '@api/apiError';
import { apiClient } from '@api/apiClient';
import { env } from '@config/env';
import {
  RoomEditDialogTypes,
  type IRoomEditActions,
  type IRoomEditWindows,
  type InventoryItemDTO,
  type PositionDTO,
  type RoomDataValue,
  type RoomDTO,
  type RoomEditViewModel,
} from '@app-types/roomEdit';

const ROOM_EDIT_PATTERN = '/creator/games/:gameId/map/rooms/:roomId';
const ROOM_NAME_MAX_LENGTH = 100;

const roomEditPath = (gameId: string, roomId: number) =>
  `/creator/games/${gameId}/map/rooms/${roomId}`;

function createRoomEditWindows(
  navigate: NavigateFunction,
  setDialogType: (dialogType: RoomEditDialogTypes | null) => void,
): IRoomEditWindows {
  return {
    showRoomEditView: (gameId, roomId) =>
      void navigate(roomEditPath(gameId, roomId)),
    showRoomSavedMessageDialog: () =>
      setDialogType(RoomEditDialogTypes.roomSaved),
    showMissingInventoryItemMessageDialog: () =>
      setDialogType(RoomEditDialogTypes.missingInventoryItem),
    showRoomLoadErrorMessageDialog: () =>
      setDialogType(RoomEditDialogTypes.loadError),
    showRoomSaveErrorMessageDialog: () =>
      setDialogType(RoomEditDialogTypes.saveError),
  };
}

function validateRoomData(
  room: RoomDTO,
  availableItems: InventoryItemDTO[],
): boolean {
  const name = room.name.trim();
  if (name.length === 0 || room.name.length > ROOM_NAME_MAX_LENGTH) {
    return false;
  }
  if (room.width <= 0 || room.height <= 0) return false;
  return room.items.every((item) =>
    availableItems.some((available) => available.itemId === item.itemId),
  );
}

function hasUnavailableItem(
  room: RoomDTO,
  availableItems: InventoryItemDTO[],
): boolean {
  return room.items.some(
    (item) =>
      !availableItems.some((available) => available.itemId === item.itemId),
  );
}

function applyRoomChange(
  room: RoomDTO,
  field: string,
  value: RoomDataValue,
): RoomDTO {
  if (field === 'name' && typeof value === 'string') {
    return { ...room, name: value };
  }
  if (field === 'description' && typeof value === 'string') {
    return { ...room, description: value };
  }
  if (field === 'zone' && typeof value === 'string') {
    return { ...room, zone: value };
  }
  if (field === 'hidden' && typeof value === 'boolean') {
    return { ...room, hidden: value };
  }
  if (field === 'items' && Array.isArray(value)) {
    return { ...room, items: value as InventoryItemDTO[] };
  }
  if (Array.isArray(value)) {
    const positions = value as PositionDTO[];
    if (field === 'sensors') {
      return {
        ...room,
        sensors: positions.map((position) => ({ position })),
      };
    }
    if (field === 'qrCodes') {
      return {
        ...room,
        qrCodes: positions.map((position) => ({ position })),
      };
    }
  }
  return room;
}

async function saveRoom(gameId: string, room: RoomDTO): Promise<RoomDTO> {
  return apiClient.maps.updateRoom(gameId, room.id, env.devUserId, room);
}

export function useRoomEdit(): {
  state: RoomEditViewModel;
  actions: IRoomEditActions;
} {
  const match = useMatch(ROOM_EDIT_PATTERN);
  const gameId = match?.params.gameId ?? null;
  const routeRoomId = match?.params.roomId ? Number(match.params.roomId) : NaN;
  const roomId = Number.isInteger(routeRoomId) ? routeRoomId : null;
  const navigate = useNavigate();
  const [state, setState] = useState<RoomEditViewModel>(() => ({
    gameId,
    room: null,
    sensors: [],
    qrCodes: [],
    availableItems: [],
    isLoading: gameId !== null && roomId !== null,
    isSaving: false,
    dialogType: null,
  }));

  const setDialogType = useCallback(
    (dialogType: RoomEditDialogTypes | null) =>
      setState((prev) => ({ ...prev, dialogType })),
    [],
  );
  const windows = createRoomEditWindows(navigate, setDialogType);

  // Only the room edit route loads data - onEditRoom just navigates there.
  // Responses for a room the user has already left are ignored.
  const latestRequestRef = useRef(0);
  const loadRoom = useCallback(async (gameId: string, roomId: number) => {
    const requestId = ++latestRequestRef.current;
    setState((prev) => ({
      ...prev,
      room: null,
      sensors: [],
      qrCodes: [],
      isLoading: true,
    }));
    try {
      const userId = env.devUserId;
      const [room, availableItems] = await Promise.all([
        apiClient.maps.getRoom(gameId, roomId, userId),
        apiClient.maps.getInventoryItems(gameId, userId),
      ]);
      if (requestId !== latestRequestRef.current) return;
      setState((prev) => ({
        ...prev,
        room,
        sensors: room.sensors,
        qrCodes: room.qrCodes,
        availableItems,
        isLoading: false,
      }));
    } catch {
      if (requestId !== latestRequestRef.current) return;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        dialogType: RoomEditDialogTypes.loadError,
      }));
    }
  }, []);

  useEffect(() => {
    if (gameId === null || roomId === null) return;
    void loadRoom(gameId, roomId);
  }, [gameId, roomId, loadRoom]);

  const onSaveChanges = () => {
    if (!state.room || !state.gameId || state.isSaving) return;
    const { room, availableItems } = state;
    if (!validateRoomData(room, availableItems)) {
      if (hasUnavailableItem(room, availableItems)) {
        windows.showMissingInventoryItemMessageDialog();
      } else {
        windows.showRoomSaveErrorMessageDialog();
      }
      return;
    }

    setState((prev) => ({ ...prev, isSaving: true }));
    saveRoom(state.gameId, room)
      .then((saved) => {
        setState((prev) => ({
          ...prev,
          room: saved,
          sensors: saved.sensors,
          qrCodes: saved.qrCodes,
          isSaving: false,
        }));
        windows.showRoomSavedMessageDialog();
      })
      .catch((error: unknown) => {
        setState((prev) => ({ ...prev, isSaving: false }));
        if (error instanceof ApiError && error.status === 409) {
          windows.showMissingInventoryItemMessageDialog();
        } else {
          windows.showRoomSaveErrorMessageDialog();
        }
      });
  };

  const hideDialogs = () => setDialogType(null);

  return {
    state: { ...state, gameId },
    actions: {
      onEditRoom: windows.showRoomEditView,
      onChangeRoomData: (field, value) =>
        setState((prev) => {
          if (!prev.room) return prev;
          const room = applyRoomChange(prev.room, field, value);
          return {
            ...prev,
            room,
            sensors: room.sensors,
            qrCodes: room.qrCodes,
          };
        }),
      onSaveChanges,
      onRoomSavedMessageDialogConfirm: hideDialogs,
      onMissingInventoryItemMessageDialogConfirm: hideDialogs,
      onRoomLoadErrorMessageDialogConfirm: hideDialogs,
      onRoomSaveErrorMessageDialogConfirm: hideDialogs,
    },
  };
}
