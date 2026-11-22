import type { AxiosInstance } from 'axios';
import type { SensorDTO} from '@/types/sensor.ts';
import type { PositionDTO } from '@/types/map.ts';

export interface ISensorsApi {
  getSensorTypes(): Promise<string[]>;
  addSensor(
    gameId: string,
    userId: string,
    sensor: SensorDTO,
  ): Promise<SensorDTO>;
}


interface SensorCreatePayload {
  type: string;
  action: string;
  position: PositionDTO
}

interface SensorResponsePayload extends SensorCreatePayload {
  id: string;
}

const toCreatePayload = (dto: SensorDTO): SensorCreatePayload => ({
  type: dto.type,
  action: dto.action,
  position: dto.position,
});

const fromResponsePayload = (data: SensorResponsePayload): SensorDTO => ({
  type: data.type,
  action: data.action,
  position: data.position,
});

export const createSensorsApi = (http: AxiosInstance): ISensorsApi => ({
  addSensor: async (
    gameId: string,
    userId: string,
    sensor: SensorDTO,
  ) => {
    const { data } = await http.post<SensorResponsePayload>(
      '/games/sensor/add',
      toCreatePayload(sensor),
      { params: { user_id: userId, game_id: gameId} },
    );
    return fromResponsePayload(data);
  },

  getSensorTypes: async () => {
    const { data } = await http.get<string[]>('/games/sensor_types');
    return data;
  },
});
