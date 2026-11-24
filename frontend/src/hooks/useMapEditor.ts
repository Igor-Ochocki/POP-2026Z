import { useCallback, useEffect, useState } from 'react';
import {
  generatePath,
  useMatch,
  useNavigate,
  type NavigateFunction,
} from 'react-router';
import { env } from '@config/env';
import { apiClient } from '@api/apiClient';
import { mapDraftStorage } from '@api/modules/mapDraftStorage';
import { useRoomEdit } from '@hooks/useRoomEdit';
import type {
  GameMapDTO,
  IMapEditorActions,
  IMapEditorWindows,
  MapEditorViewModel,
  PassageDTO,
  RoomDTO,
} from '@app-types/map';

const DEFAULT_CONTAINER = { width: 1200, height: 800 };
const DEFAULT_ROOM_SIZE = { width: 200, height: 150 };

const MAP_EDITOR_PATH = '/creator/games/:gameId/map';

const mapEditorURL = (gameId: string) =>
  generatePath(MAP_EDITOR_PATH, { gameId });

const createDefaultMap = (): GameMapDTO => ({
  id: 0,
  name: '',
  description: '',
  container: { ...DEFAULT_CONTAINER },
  rooms: [],
  passages: [],
  isValid: false,
});

const nextId = (ids: number[]) => (ids.length ? Math.max(...ids) + 1 : 1);

function createMapEditorWindows(
  setState: React.Dispatch<React.SetStateAction<MapEditorViewModel>>,
  navigate: NavigateFunction,
): IMapEditorWindows {
  return {
    showMapEditorView: (gameId) => void navigate(mapEditorURL(gameId)),
    showMapSavedMessageDialog: () =>
      setState((prev) => ({ ...prev, dialogType: 'mapSaved' })),
    showIncorrectMapDataMessageDialog: () =>
      setState((prev) => ({ ...prev, dialogType: 'incorrectMapData' })),
    showMapSaveErrorMessageDialog: () =>
      setState((prev) => ({ ...prev, dialogType: 'saveError' })),
    showMapSaveBrowserErrorMessageDialog: () =>
      setState((prev) => ({ ...prev, dialogType: 'browserSaveError' })),
    hideDialogs: () => setState((prev) => ({ ...prev, dialogType: null })),
  };
}

function updateRoom(
  map: GameMapDTO,
  roomId: number,
  data: Partial<RoomDTO>,
): GameMapDTO {
  return {
    ...map,
    rooms: map.rooms.map((room) =>
      room.id === roomId ? { ...room, ...data, id: room.id } : room,
    ),
  };
}

function addRoom(map: GameMapDTO): { map: GameMapDTO; roomId: number } {
  const id = nextId(map.rooms.map((r) => r.id));
  const offset = 20 * map.rooms.length;
  const room: RoomDTO = {
    id,
    name: `Komnata ${id}`,
    description: '',
    width: DEFAULT_ROOM_SIZE.width,
    height: DEFAULT_ROOM_SIZE.height,
    position: { x: offset, y: offset },
  };
  return { map: { ...map, rooms: [...map.rooms, room] }, roomId: id };
}

function removeRoom(map: GameMapDTO, roomId: number): GameMapDTO {
  return {
    ...map,
    rooms: map.rooms.filter((room) => room.id !== roomId),
    passages: map.passages.filter(
      (p) => p.room1Id !== roomId && p.room2Id !== roomId,
    ),
  };
}

function addPassage(
  map: GameMapDTO,
  room1Id: number,
  room2Id: number,
): { map: GameMapDTO; passageId: number } | null {
  const room1 = map.rooms.find((r) => r.id === room1Id);
  const room2 = map.rooms.find((r) => r.id === room2Id);
  if (!room1 || !room2 || room1Id === room2Id) return null;

  const exists = map.passages.some(
    (p) =>
      (p.room1Id === room1Id && p.room2Id === room2Id) ||
      (p.room1Id === room2Id && p.room2Id === room1Id),
  );
  if (exists) return null;

  const id = nextId(map.passages.map((p) => p.id));
  const passage: PassageDTO = {
    id,
    room1Id,
    room2Id,
    position: {
      x:
        (room1.position.x +
          room1.width / 2 +
          room2.position.x +
          room2.width / 2) /
        2,
      y:
        (room1.position.y +
          room1.height / 2 +
          room2.position.y +
          room2.height / 2) /
        2,
    },
  };
  return {
    map: { ...map, passages: [...map.passages, passage] },
    passageId: id,
  };
}

function updatePassage(
  map: GameMapDTO,
  passageId: number,
  data: Partial<PassageDTO>,
): GameMapDTO {
  return {
    ...map,
    passages: map.passages.map((p) =>
      p.id === passageId ? { ...p, ...data, id: p.id } : p,
    ),
  };
}

function removePassage(map: GameMapDTO, passageId: number): GameMapDTO {
  return {
    ...map,
    passages: map.passages.filter((p) => p.id !== passageId),
  };
}

function isMapValid(map: GameMapDTO): boolean {
  const { rooms, passages, container } = map;
  if (rooms.length === 0) return false;

  const inside = rooms.every(
    (r) =>
      r.position.x >= 0 &&
      r.position.y >= 0 &&
      r.position.x + r.width <= container.width &&
      r.position.y + r.height <= container.height,
  );
  if (!inside) return false;

  const overlap = rooms.some((a, i) =>
    rooms
      .slice(i + 1)
      .some(
        (b) =>
          a.position.x < b.position.x + b.width &&
          b.position.x < a.position.x + a.width &&
          a.position.y < b.position.y + b.height &&
          b.position.y < a.position.y + a.height,
      ),
  );
  if (overlap) return false;

  const ids = new Set(rooms.map((r) => r.id));
  if (passages.some((p) => !ids.has(p.room1Id) || !ids.has(p.room2Id))) {
    return false;
  }

  const visited = new Set<number>([rooms[0].id]);
  const queue = [rooms[0].id];
  while (queue.length > 0) {
    const current = queue.pop() as number;
    for (const p of passages) {
      const other =
        p.room1Id === current
          ? p.room2Id
          : p.room2Id === current
            ? p.room1Id
            : null;
      if (other !== null && !visited.has(other)) {
        visited.add(other);
        queue.push(other);
      }
    }
  }
  return visited.size === ids.size;
}

export function useMapEditor(): {
  state: MapEditorViewModel;
  actions: IMapEditorActions;
} {
  const gameId = useMatch(MAP_EDITOR_PATH)?.params.gameId ?? '';
  const navigate = useNavigate();
  const { actions: roomEditActions } = useRoomEdit();

  const [state, setState] = useState<MapEditorViewModel>({
    gameId,
    map: createDefaultMap(),
    selectedRoomId: null,
    selectedPassageId: null,
    isAutoSaveEnabled: true,
    lastSaveTime: null,
    isSubmitting: false,
    dialogType: null,
    isLoading: Boolean(gameId),
    isMapMissing: false,
    errorMessage: null,
  });

  const windows = createMapEditorWindows(setState, navigate);

  const loadMap = useCallback(
    async (
      targetGameId: string,
      targetUserId: string,
      isCancelled: () => boolean,
    ) => {
      setState((prev) => ({
        ...prev,
        gameId: targetGameId,
        selectedRoomId: null,
        selectedPassageId: null,
        isLoading: true,
        isMapMissing: false,
        errorMessage: null,
      }));
      try {
        const serverMap = await apiClient.maps.getMap(
          targetGameId,
          targetUserId,
        );
        if (isCancelled()) return;
        const draft = mapDraftStorage.loadDraft(targetGameId);
        setState((prev) => ({
          ...prev,
          map: draft ?? serverMap,
          isLoading: false,
          isMapMissing: false,
        }));
      } catch (err: unknown) {
        if (isCancelled()) return;
        const status = (err as { status?: number | null } | null)?.status;
        if (status === 404) {
          const draft = mapDraftStorage.loadDraft(targetGameId);
          if (draft) {
            setState((prev) => ({
              ...prev,
              map: draft,
              isLoading: false,
              isMapMissing: false,
              errorMessage: null,
            }));
            return;
          }
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isMapMissing: true,
            errorMessage: null,
          }));
          return;
        }
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isMapMissing: false,
          errorMessage: 'Nie udało się wczytać mapy gry. Spróbuj ponownie.',
        }));
      }
    },
    [],
  );

  useEffect(() => {
    if (!gameId) return;
    let cancelled = false;
    void loadMap(gameId, env.devUserId, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [gameId, loadMap]);

  const handleAutoSaveLocally = (map: GameMapDTO) => {
    if (!state.isAutoSaveEnabled) return;
    try {
      mapDraftStorage.saveDraft(gameId, map);
      setState((prev) => ({ ...prev, lastSaveTime: new Date() }));
    } catch {
      windows.showMapSaveBrowserErrorMessageDialog();
    }
  };

  const saveMapToSystem = async (map: GameMapDTO) => {
    setState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await apiClient.maps.editMap({ gameId, userId: env.devUserId, map });
      try {
        mapDraftStorage.clearDraft(gameId);
      } catch {}
      setState((prev) => ({ ...prev, isSubmitting: false }));
      windows.showMapSavedMessageDialog();
    } catch {
      setState((prev) => ({ ...prev, isSubmitting: false }));
      windows.showMapSaveErrorMessageDialog(); // C
    }
  };

  const applyMapChange = (
    map: GameMapDTO,
    selection: Partial<
      Pick<MapEditorViewModel, 'selectedRoomId' | 'selectedPassageId'>
    > = {},
  ) => {
    setState((prev) => ({ ...prev, map, ...selection }));
    handleAutoSaveLocally(map);
  };

  const actions: IMapEditorActions = {
    onOpenMapEditor: (targetGameId) => windows.showMapEditorView(targetGameId),

    onRoomSelected: (roomId) =>
      setState((prev) => ({
        ...prev,
        selectedRoomId: roomId,
        selectedPassageId: null,
      })),

    onSelectedRoomChange: (data) => {
      if (state.selectedRoomId === null) return;
      applyMapChange(updateRoom(state.map, state.selectedRoomId, data));
    },

    onPassageSelected: (passageId) =>
      setState((prev) => ({
        ...prev,
        selectedPassageId: passageId,
        selectedRoomId: null,
      })),

    onSelectedPassageChange: (data) => {
      if (state.selectedPassageId === null) return;
      applyMapChange(updatePassage(state.map, state.selectedPassageId, data));
    },

    onContainerChange: (data) => {
      const container = { ...state.map.container, ...data };
      if (!(container.width > 0) || !(container.height > 0)) return;
      applyMapChange({ ...state.map, container });
    },

    onEditSelectedRoom: () => {
      const room = state.map.rooms.find((r) => r.id === state.selectedRoomId);
      if (room) roomEditActions.onEditRoom(gameId, room.id);
    },

    onAddRoom: () => {
      const { map, roomId } = addRoom(state.map);
      applyMapChange(map, { selectedRoomId: roomId, selectedPassageId: null });
    },

    onRemoveSelectedRoom: () => {
      if (state.selectedRoomId === null) return;
      applyMapChange(removeRoom(state.map, state.selectedRoomId), {
        selectedRoomId: null,
        selectedPassageId: null,
      });
    },

    onAddPassage: (room1Id, room2Id) => {
      const result = addPassage(state.map, room1Id, room2Id);
      if (!result) return;
      applyMapChange(result.map, {
        selectedRoomId: null,
        selectedPassageId: result.passageId,
      });
    },

    onRemoveSelectedPassage: () => {
      if (state.selectedPassageId === null) return;
      applyMapChange(removePassage(state.map, state.selectedPassageId), {
        selectedPassageId: null,
      });
    },

    onSaveAndExit: () => {
      if (state.isSubmitting) return;
      const map = { ...state.map, isValid: isMapValid(state.map) };
      setState((prev) => ({ ...prev, map }));
      if (!map.isValid) {
        windows.showIncorrectMapDataMessageDialog(); // D
        return;
      }
      void saveMapToSystem(map);
    },

    onRetryBrowserSave: () => {
      windows.hideDialogs();
      handleAutoSaveLocally(state.map);
    },
    onContinueWithoutBrowserSave: () =>
      setState((prev) => ({
        ...prev,
        isAutoSaveEnabled: false,
        dialogType: null,
      })),

    onRetrySystemSave: () => {
      windows.hideDialogs();
      void saveMapToSystem(state.map);
    },

    onReturnToEditing: () => windows.hideDialogs(),
    onSaveAsInvalid: () => {
      windows.hideDialogs();
      void saveMapToSystem({ ...state.map, isValid: false });
    },

    onExitWithoutSaving: () => windows.hideDialogs(),
    onGenerateMap: () => {
      const freshMap = createDefaultMap();
      setState((prev) => ({
        ...prev,
        isMapMissing: false,
        errorMessage: null,
        selectedRoomId: null,
        selectedPassageId: null,
      }));
      applyMapChange(freshMap);
    },
  };

  return { state, actions };
}
