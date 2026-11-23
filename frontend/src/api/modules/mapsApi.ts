import type { AxiosInstance } from 'axios';
import type {
  GameMapDTO,
  MapContainerDTO,
  MapSaveDTO,
  PassageDTO,
  PositionDTO,
  RoomDTO,
} from '@app-types/map';

interface PositionSchema extends PositionDTO {}

interface PassageSchema {
  id: number;
  room1Id: number;
  room2Id: number;
  position: PositionSchema;
}

interface RoomSchema {
  id: number;
  name: string;
  description: string;
  width: number;
  height: number;
  position: PositionSchema;
}

interface MapContainerSchema extends MapContainerDTO {}

interface MapSchema {
  id: number;
  name: string;
  description: string;
  container: MapContainerSchema;
  rooms: RoomSchema[];
  passages: PassageSchema[];
  isValid: boolean;
}

const toPassageSchema = (p: PassageDTO): PassageSchema => ({
  id: p.id,
  room1Id: p.room1Id,
  room2Id: p.room2Id,
  position: p.position,
});

const toRoomSchema = (r: RoomDTO): RoomSchema => ({
  id: r.id,
  name: r.name,
  description: r.description,
  width: r.width,
  height: r.height,
  position: r.position,
});

const toMapSchema = (map: GameMapDTO): MapSchema => ({
  id: map.id,
  name: map.name,
  description: map.description,
  container: map.container,
  rooms: map.rooms.map(toRoomSchema),
  passages: map.passages.map(toPassageSchema),
  isValid: map.isValid,
});

const fromMapSchema = (schema: MapSchema): GameMapDTO => ({
  id: schema.id,
  name: schema.name,
  description: schema.description,
  container: schema.container,
  rooms: schema.rooms.map(toRoomSchema),
  passages: schema.passages.map(toPassageSchema),
  isValid: schema.isValid,
});

export const createMapsApi = (http: AxiosInstance) => ({
  getMap: async (gameId: string, userId: string): Promise<GameMapDTO> => {
    const { data } = await http.get<MapSchema>(`/games/${gameId}/map`, {
      params: { user_id: userId },
    });
    return fromMapSchema(data);
  },

  editMap: async ({ gameId, userId, map }: MapSaveDTO): Promise<GameMapDTO> => {
    const { data } = await http.post<MapSchema>(
      `/games/${gameId}/map/edit`,
      toMapSchema(map),
      { params: { user_id: userId } },
    );
    return fromMapSchema(data);
  },
});

export type MapsApi = ReturnType<typeof createMapsApi>;
