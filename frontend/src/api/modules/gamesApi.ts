import type { AxiosInstance } from 'axios';
import type {
  GameCreateDTO,
  GameMetadataDTO,
  GameResponseDTO,
} from '@app-types/game';

export interface IGamesApi {
  getGame(gameId: string, userId: string): Promise<GameResponseDTO>;
  saveGame(
    userId: string,
    metadata: GameCreateDTO,
    asDraft: boolean,
  ): Promise<GameResponseDTO>;
  editGame(
    gameId: string,
    userId: string,
    metadata: GameCreateDTO,
    asDraft: boolean,
  ): Promise<GameResponseDTO>;
  submitToReviewer(gameId: string, userId: string): Promise<boolean>;
  getGames(
    userId: string,
    tags: string[],
    limit: number,
    offset: number,
  ): Promise<GameMetadataDTO[]>;
  getGameTags(): Promise<string[]>;
}

// Backend payloads (GameCreateSchema / GameResponseSchema) - snake_case stays inside this module.
interface GameCreatePayload {
  title: string;
  description: string;
  min_players: number;
  max_players: number;
  duration_minutes: number;
  requires_invitation: boolean;
  tags: string[];
}

interface GameResponsePayload extends GameCreatePayload {
  game_id: string;
  status: string;
}

const toCreatePayload = (dto: GameCreateDTO): GameCreatePayload => ({
  title: dto.title,
  description: dto.description,
  min_players: dto.minPlayers,
  max_players: dto.maxPlayers,
  duration_minutes: dto.durationMinutes,
  requires_invitation: dto.requiresInvitation,
  tags: dto.tags,
});

const fromResponsePayload = (data: GameResponsePayload): GameResponseDTO => ({
  gameId: data.game_id,
  title: data.title,
  description: data.description,
  minPlayers: data.min_players,
  maxPlayers: data.max_players,
  durationMinutes: data.duration_minutes,
  requiresInvitation: data.requires_invitation,
  tags: data.tags,
  status: data.status,
});

export const createGamesApi = (http: AxiosInstance): IGamesApi => ({
  getGame: async (gameId, userId) => {
    const { data } = await http.get<GameResponsePayload>(`/games/${gameId}`, {
      params: { user_id: userId },
    });
    return fromResponsePayload(data);
  },

  saveGame: async (userId, metadata, asDraft) => {
    const { data } = await http.post<GameResponsePayload>(
      '/games',
      toCreatePayload(metadata),
      { params: { user_id: userId, as_draft: asDraft } },
    );
    return fromResponsePayload(data);
  },

  editGame: async (gameId, userId, metadata, asDraft) => {
    const { data } = await http.put<GameResponsePayload>(
      `/games/${gameId}`,
      toCreatePayload(metadata),
      { params: { user_id: userId, as_draft: asDraft } },
    );
    return fromResponsePayload(data);
  },

  submitToReviewer: async (gameId, userId) => {
    const { data } = await http.post<boolean>(
      `/games/${gameId}/submit`,
      undefined,
      { params: { user_id: userId } },
    );
    return data;
  },

  getGames: async (userId, tags, limit, offset) => {
    const { data } = await http.get<GameResponsePayload[]>('/games', {
      params: { user_id: userId, tags, limit, offset },
      // FastAPI expects tags=a&tags=b, not axios' default tags[]=a&tags[]=b.
      paramsSerializer: { indexes: null },
    });
    return data.map(fromResponsePayload);
  },

  getGameTags: async () => {
    const { data } = await http.get<string[]>('/games/tags');
    return data;
  },
});
