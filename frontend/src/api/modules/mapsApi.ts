import type { AxiosInstance } from 'axios';
import type {
  InventoryItemDTO,
  PassageDTO,
  PositionDTO,
  RoomDTO,
} from '@app-types/roomEdit';
import type {
  GameMapDTO,
  MapContainerDTO,
  MapSaveDTO,
  PassageDTO as MapPassageDTO,
  RoomDTO as MapRoomDTO,
} from '@app-types/map';

interface PositionPayload {
  x: number;
  y: number;
}

interface PassagePayload {
  id: number;
  room1_id: number;
  room2_id: number;
  position: PositionPayload;
}

interface InventoryItemPayload {
  item_id: string;
  name: string;
}

interface PositionedPayload {
  position: PositionPayload;
}

interface RoomPayload {
  id: number;
  name: string;
  description: string;
  hidden: boolean;
  zone: string;
  position: PositionPayload;
  width: number;
  height: number;
  passages: PassagePayload[];
  items: InventoryItemPayload[];
  sensors: PositionedPayload[];
  qr_codes: PositionedPayload[];
}

const fromPosition = (position: PositionPayload): PositionDTO => ({
  x: position.x,
  y: position.y,
});

const toPosition = (position: PositionDTO): PositionPayload => ({
  x: position.x,
  y: position.y,
});

const fromPassage = (passage: PassagePayload): PassageDTO => ({
  id: passage.id,
  room1Id: passage.room1_id,
  room2Id: passage.room2_id,
  position: fromPosition(passage.position),
});

const toPassage = (passage: PassageDTO): PassagePayload => ({
  id: passage.id,
  room1_id: passage.room1Id,
  room2_id: passage.room2Id,
  position: toPosition(passage.position),
});

const fromRoomPayload = (room: RoomPayload): RoomDTO => ({
  id: room.id,
  name: room.name,
  description: room.description,
  hidden: room.hidden,
  zone: room.zone,
  position: fromPosition(room.position),
  width: room.width,
  height: room.height,
  passages: room.passages.map(fromPassage),
  items: room.items.map((item) => ({ itemId: item.item_id, name: item.name })),
  sensors: room.sensors.map((sensor) => ({
    position: fromPosition(sensor.position),
  })),
  qrCodes: room.qr_codes.map((qrCode) => ({
    position: fromPosition(qrCode.position),
  })),
});

const toRoomPayload = (room: RoomDTO): RoomPayload => ({
  id: room.id,
  name: room.name,
  description: room.description,
  hidden: room.hidden,
  zone: room.zone,
  position: toPosition(room.position),
  width: room.width,
  height: room.height,
  passages: room.passages.map(toPassage),
  items: room.items.map((item) => ({ item_id: item.itemId, name: item.name })),
  sensors: room.sensors.map((sensor) => ({
    position: toPosition(sensor.position),
  })),
  qr_codes: room.qrCodes.map((qrCode) => ({
    position: toPosition(qrCode.position),
  })),
});

// PU60 - cała mapa gry
interface MapPassageSchema {
  id: number;
  room1Id: number;
  room2Id: number;
  position: PositionPayload;
}

interface MapRoomSchema {
  id: number;
  name: string;
  description: string;
  width: number;
  height: number;
  position: PositionPayload;
}

interface MapSchema {
  id: number;
  name: string;
  description: string;
  container: MapContainerDTO;
  rooms: MapRoomSchema[];
  passages: MapPassageSchema[];
  isValid: boolean;
}

const toMapPassageSchema = (p: MapPassageDTO): MapPassageSchema => ({
  id: p.id,
  room1Id: p.room1Id,
  room2Id: p.room2Id,
  position: p.position,
});

const toMapRoomSchema = (r: MapRoomDTO): MapRoomSchema => ({
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
  rooms: map.rooms.map(toMapRoomSchema),
  passages: map.passages.map(toMapPassageSchema),
  isValid: map.isValid,
});

const fromMapSchema = (schema: MapSchema): GameMapDTO => ({
  id: schema.id,
  name: schema.name,
  description: schema.description,
  container: schema.container,
  rooms: schema.rooms.map(toMapRoomSchema),
  passages: schema.passages.map(toMapPassageSchema),
  isValid: schema.isValid,
});

export interface IMapsApi {
  getMap(gameId: string, userId: string): Promise<GameMapDTO>;
  editMap(dto: MapSaveDTO): Promise<GameMapDTO>;
  getRoom(gameId: string, roomId: number, userId: string): Promise<RoomDTO>;
  getInventoryItems(
    gameId: string,
    userId: string,
  ): Promise<InventoryItemDTO[]>;
  updateRoom(
    gameId: string,
    roomId: number,
    userId: string,
    room: RoomDTO,
  ): Promise<RoomDTO>;
}

export const createMapsApi = (http: AxiosInstance): IMapsApi => ({
  getMap: async (gameId, userId) => {
    const { data } = await http.get<MapSchema>(`/games/${gameId}/map`, {
      params: { user_id: userId },
    });
    return fromMapSchema(data);
  },

  editMap: async ({ gameId, userId, map }) => {
    const { data } = await http.post<MapSchema>(
      `/games/${gameId}/map/edit`,
      toMapSchema(map),
      { params: { user_id: userId } },
    );
    return fromMapSchema(data);
  },

  getRoom: async (gameId, roomId, userId) => {
    const { data } = await http.get<RoomPayload>(
      `/games/${gameId}/map/rooms/${roomId}`,
      { params: { user_id: userId } },
    );
    return fromRoomPayload(data);
  },

  getInventoryItems: async (gameId, userId) => {
    const { data } = await http.get<InventoryItemPayload[]>(
      `/games/${gameId}/inventory_items`,
      { params: { user_id: userId } },
    );
    return data.map((item) => ({ itemId: item.item_id, name: item.name }));
  },

  updateRoom: async (gameId, roomId, userId, room) => {
    const { data } = await http.put<RoomPayload>(
      `/games/${gameId}/map/rooms/${roomId}`,
      toRoomPayload(room),
      { params: { user_id: userId } },
    );
    return fromRoomPayload(data);
  },
});
