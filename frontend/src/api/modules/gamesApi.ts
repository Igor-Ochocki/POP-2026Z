import type { AxiosInstance } from 'axios';
import type { GameCreatePayload, GameResponsePayload } from '@app-types/game';

export const createGamesApi = (http: AxiosInstance) => ({
  saveGame: async (
    metadata: GameCreatePayload,
    asDraft: boolean,
  ): Promise<GameResponsePayload> => {
    const { data } = await http.post<GameResponsePayload>('/games', metadata, {
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
