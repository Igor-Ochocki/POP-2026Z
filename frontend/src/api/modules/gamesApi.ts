import type { AxiosInstance } from 'axios';
import type { GameCreateDTO, GameResponseDTO } from '@app-types/game';

export interface IGamesApi {
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

  getGames: async (
    tags: string[],
    limit: number,
    offset: number,
  ): Promise<GameMetadataDTO[]> => {
    const response = await http.get('/games', {
      params: { tags, limit, offset },
    });
    if (response.status !== 200) {
      throw response.status;
    }
    return response.data.map(fromResponsePayload);
  },

  getGameTags: async (): Promise<string[]> => {
    const response = await http.get('/games/tags');
    if (response.status !== 200) {
      throw response.status;
    }
    return response.data;
  },
});
