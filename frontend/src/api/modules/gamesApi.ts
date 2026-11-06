import type { AxiosInstance } from 'axios';
import type { GameCreateDTO, GameResponseDTO } from '@app-types/game';

export const createGamesApi = (http: AxiosInstance) => ({
  saveGame: async (
    metadata: GameCreateDTO,
    asDraft: boolean,
  ): Promise<GameResponseDTO> => {
    const { data } = await http.post<GameResponseDTO>('/games', metadata, {
      params: { as_draft: asDraft },
    });
    return data;
  },

  submitToReviewer: async (gameId: string): Promise<boolean> => {
    const { data } = await http.post<boolean>(`/games/${gameId}/submit`);
    return data;
  },
});

export type IGamesApi = ReturnType<typeof createGamesApi>;
