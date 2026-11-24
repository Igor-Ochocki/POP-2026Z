import type { AxiosInstance } from 'axios';
import type {
  InventoryItemDTO,
  PassageDTO,
  PositionDTO,
  RoomDTO,
} from '@app-types/roomEdit';

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

export interface IMapsApi {
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
