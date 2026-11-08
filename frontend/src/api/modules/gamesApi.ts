import type { AxiosInstance } from 'axios';
import type { GameCreateDTO, GameResponseDTO } from '@app-types/game';

export const createGamesApi = (http: AxiosInstance) => ({
  saveGame: async (
    userId: string,
    metadata: GameCreateDTO,
    asDraft: boolean,
  ): Promise<GameResponseDTO> => {
    const { data } = await http.post<GameResponseDTO>('/games', metadata, {
      params: { user_id: userId, as_draft: asDraft },
    });
    return data;
  },

  editGame: async (
    gameId: string,
    userId: string,
    metadata: GameCreateDTO,
    asDraft: boolean,
  ): Promise<GameResponseDTO> => {
    const { data } = await http.put<GameResponseDTO>(
      `/games/${gameId}`,
      metadata,
      { params: { user_id: userId, as_draft: asDraft } },
    );
    return data;
  },

  submitToReviewer: async (
    gameId: string,
    userId: string,
  ): Promise<boolean> => {
    const { data } = await http.post<boolean>(
      `/games/${gameId}/submit`,
      undefined,
      { params: { user_id: userId } },
    );
    return data;
  },
});

export type IGamesApi = ReturnType<typeof createGamesApi>;
