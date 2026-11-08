import { useNavigate } from 'react-router';
import type { IGameListActions } from '@app-types/gameList';

const GAME_LIST_PATH = '/creator/games';

export function useGameList(): { actions: IGameListActions } {
  const navigate = useNavigate();

  return {
    actions: {
      onOpenGameList: () => void navigate(GAME_LIST_PATH),
    },
  };
}
