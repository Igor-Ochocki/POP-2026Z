import { apiClient } from '@api/apiClient.ts';
import React, { useEffect, useState } from 'react';
import type { IGameListActions, IGameListWindows } from '@/types/game-list.ts';
import type { GameMetadataDTO } from '@/types/game.ts';
import { type NavigateFunction, useNavigate } from 'react-router';

const DOWNLOAD_LIMIT = 10;

export type GameListViewModel = {
  games: GameMetadataDTO[];
  searchString: string;
  filterTags: string[];
  appliedTags: string[];
  downloadOffset: number;
  downloadErrored: boolean;
  filterDialogOpen: boolean;
};

async function loadGames(
  tags: string[],
  downloadOffset: number,
): Promise<GameMetadataDTO[]> {
  return apiClient.games.getGames(tags, DOWNLOAD_LIMIT, downloadOffset);
}

async function loadTags(): Promise<string[]> {
  return apiClient.games.getGameTags();
}

function createGameListWindows(
  setViewModel: React.Dispatch<React.SetStateAction<GameListViewModel>>,
  navigate: NavigateFunction,
): IGameListWindows {
  return {
    showGameListView: () => navigate('/creator/games'),
    showGameFilterDialog: () =>
      setViewModel((vm) => ({ ...vm, filterDialogOpen: true })),
  };
}

export function useGameList() {
  const [state, setState] = useState<GameListViewModel>({
    games: [],
    searchString: '',
    filterTags: [],
    appliedTags: [],
    downloadOffset: 0,
    downloadErrored: false,
    filterDialogOpen: false,
  });
  const navigate = useNavigate();
  const { showGameListView, showGameFilterDialog } = createGameListWindows(
    setState,
    navigate,
  );

  useEffect(() => {
    loadGames(state.appliedTags, state.downloadOffset)
      .then((games) => setState({ ...state, games }))
      .catch(() => setState({ ...state, downloadErrored: true }));

    loadTags().then((tags) => setState({ ...state, filterTags: tags }));

    return () => {};
  }, []);

  const actions: IGameListActions = {
    onOpenGameList: () => showGameListView(),
    onOpenFilterDialog: () => showGameFilterDialog(),

    onFilterSubmit: (appliedTags) => {
      setState((vm) => ({
        ...vm,
        appliedTags,
        filterDialogOpen: false,
      }));

      loadGames(appliedTags, state.downloadOffset)
        .then((games) =>
          setState((vm) => ({
            ...vm,
            games,
          })),
        )
        .catch(() =>
          setState((vm) => ({
            ...vm,
            downloadErrored: true,
          })),
        );
    },

    onChangeParameter: (field: string, value: any) => {
      setState({ ...state, [field]: value });
    },
    onListReload: () => {
      loadGames(state.appliedTags, state.downloadOffset)
        .then((games) => setState({ ...state, games }))
        .catch(() => setState({ ...state, downloadErrored: true }));
    },
    onShowMore: () => {
      loadGames(state.appliedTags, state.downloadOffset + DOWNLOAD_LIMIT)
        .then((games) => {
          const newGames = state.games.concat(games);
          setState({
            ...state,
            games: newGames,
            downloadOffset: newGames.length,
          });
        })
        .catch(() => setState({ ...state, downloadErrored: true }));
    },
  };
  return { state, actions };
}
