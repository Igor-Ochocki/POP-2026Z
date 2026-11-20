
import type { AxiosInstance } from 'axios';
import { ApiError } from '@api/apiError';
import type {
  GameMapDTO,
  MapSaveDTO,
  PassageDTO,
  PositionDTO,
  RoomDTO,
} from '@app-types/map';
 
interface PassagePayload {
  id: number;
  room1_id: number;
  room2_id: number;
  position: PositionDTO;
}
 
interface RoomPayload {
  id: number;
  name: string;
  width: number;
  height: number;
  position: PositionDTO;
  passages: PassagePayload[];
}
 
interface MapPayload {
  container: { width: number; height: number };
  rooms: RoomPayload[];
  is_valid: boolean;
}
 
const toPassagePayload = (passage: PassageDTO): PassagePayload => ({
  id: passage.id,
  room1_id: passage.room1Id,
  room2_id: passage.room2Id,
  position: passage.position,
});
 
const fromPassagePayload = (passage: PassagePayload): PassageDTO => ({
  id: passage.id,
  room1Id: passage.room1_id,
  room2Id: passage.room2_id,
  position: passage.position,
});
 
const toRoomPayload = (room: RoomDTO): RoomPayload => ({
  id: room.id,
  name: room.name,
  width: room.width,
  height: room.height,
  position: room.position,
  passages: room.passages.map(toPassagePayload),
});
 
const fromRoomPayload = (room: RoomPayload): RoomDTO => ({
  id: room.id,
  name: room.name,
  width: room.width,
  height: room.height,
  position: room.position,
  passages: room.passages.map(fromPassagePayload),
});
 
const toMapPayload = (map: GameMapDTO): MapPayload => ({
  container: map.container,
  rooms: map.rooms.map(toRoomPayload),
  is_valid: map.isValid,
});
 
const fromMapPayload = (map: MapPayload): GameMapDTO => ({
  container: map.container,
  rooms: map.rooms.map(fromRoomPayload),
  isValid: map.is_valid,
});
 
export const createMapsApi = (http: AxiosInstance) => ({
  getMap: async (gameId: string): Promise<GameMapDTO | null> => {
    try {
      const { data } = await http.get<MapPayload>(`/games/${gameId}/map`);
      return fromMapPayload(data);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
 
  saveMap: async ({ gameId, map }: MapSaveDTO): Promise<GameMapDTO> => {
    const { data } = await http.put<MapPayload>(
      `/games/${gameId}/map`,
      toMapPayload(map),
    );
    return fromMapPayload(data);
  },
});
 
export type MapsApi = ReturnType<typeof createMapsApi>;
