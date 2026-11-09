import { useEffect, useState } from 'react';
import { useLocation, useNavigate, type NavigateFunction } from 'react-router';
import { apiClient } from '@api/apiClient';
import { env } from '@config/env';
import type {
  GameListNavigationState,
  GameListViewModel,
  IGameListActions,
  IGameListWindows,
} from '@app-types/gameList';

const GAME_LIST_PATH = '/creator/games';
const DOWNLOAD_LIMIT = 10;

const initialState: GameListViewModel = {
  games: [],
  searchString: '',
  filterTags: [],
  appliedTags: [],
  downloadOffset: 0,
  hasMoreGames: false,
  downloadErrored: false,
  filterDialogOpen: false,
};

type SetState = React.Dispatch<React.SetStateAction<GameListViewModel>>;

// offset 0 replaces the list, any other offset appends the next page.
async function loadGames(setState: SetState, tags: string[], offset: number) {
  setState((prev) => ({ ...prev, downloadErrored: false }));
  try {
    const page = await apiClient.games.getGames(
      env.devUserId,
      tags,
      DOWNLOAD_LIMIT,
      offset,
    );
    setState((prev) => {
      const games = offset === 0 ? page : [...prev.games, ...page];
      return {
        ...prev,
        games,
        downloadOffset: games.length,
        hasMoreGames: page.length === DOWNLOAD_LIMIT,
      };
    });
  } catch {
    setState((prev) => ({ ...prev, downloadErrored: true }));
  }
}

async function loadTags(setState: SetState) {
  try {
    const filterTags = await apiClient.games.getGameTags();
    setState((prev) => ({ ...prev, filterTags }));
  } catch {
    setState((prev) => ({ ...prev, downloadErrored: true }));
  }
}

function createGameListWindows(
  setState: SetState,
  navigate: NavigateFunction,
): IGameListWindows {
  return {
    showGameListView: (navigationState) =>
      void navigate(GAME_LIST_PATH, { state: navigationState }),
    showGameFilterDialog: () =>
      setState((prev) => ({ ...prev, filterDialogOpen: true })),
  };
}

export function useGameList(): {
  state: GameListViewModel;
  actions: IGameListActions;
} {
  const navigate = useNavigate();
  const location = useLocation();

  // Other views use this hook only to call onOpenGameList, so the API is called
  // only once the list was opened with data passed through navigation.
  const navigationState = location.state as GameListNavigationState | null;
  const openedWithTags = navigationState?.appliedTags;

  const [state, setState] = useState<GameListViewModel>(() => ({
    ...initialState,
    appliedTags: openedWithTags ?? [],
  }));
  const windows = createGameListWindows(setState, navigate);

  useEffect(() => {
    if (!openedWithTags) return;
    void loadTags(setState);
    void loadGames(setState, openedWithTags, 0);
  }, [openedWithTags]);

  return {
    state,
    actions: {
      onOpenGameList: () => windows.showGameListView({ appliedTags: [] }),
      onOpenFilterDialog: windows.showGameFilterDialog,
      onChangeParameter: (field, value) =>
        setState((prev) => ({ ...prev, [field]: value })),
      onFilterSubmit: (appliedTags) => {
        setState((prev) => ({ ...prev, appliedTags, filterDialogOpen: false }));
        void loadGames(setState, appliedTags, 0);
      },
      onListReload: () => {
        void loadTags(setState);
        void loadGames(setState, state.appliedTags, 0);
      },
      onShowMore: () =>
        void loadGames(setState, state.appliedTags, state.downloadOffset),
    },
  };
}
