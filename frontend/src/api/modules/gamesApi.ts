import type { AxiosInstance } from 'axios';
import type { GameMetadataDTO } from '@app-types/game';

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

const toCreatePayload = (dto: GameMetadataDTO): GameCreatePayload => ({
  title: dto.title,
  description: dto.description,
  min_players: dto.minPlayers,
  max_players: dto.maxPlayers,
  duration_minutes: dto.durationMinutes,
  requires_invitation: dto.requiresInvitation,
  tags: dto.tags,
});

const fromResponsePayload = (data: GameResponsePayload): GameMetadataDTO => ({
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

export const createGamesApi = (http: AxiosInstance) => ({
  saveGame: async (
    metadata: GameMetadataDTO,
    asDraft: boolean,
  ): Promise<GameMetadataDTO> => {
    const { data } = await http.post<GameResponsePayload>(
      '/games',
      toCreatePayload(metadata),
      { params: { as_draft: asDraft } },
    );
    return fromResponsePayload(data);
  },

  submitToReviewer: async (gameId: string): Promise<boolean> => {
    const { data } = await http.post<boolean>(`/games/${gameId}/submit`);
    return data;
  },
});

export type GamesApi = ReturnType<typeof createGamesApi>;
