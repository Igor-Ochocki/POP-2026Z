import type { GameMetadataDTO } from '@app-types/game';

export interface GameListParameters {
  searchString: string;
}

export interface GameListViewModel extends GameListParameters {
  games: GameMetadataDTO[];
  filterTags: string[];
  appliedTags: string[];
  downloadOffset: number;
  hasMoreGames: boolean;
  downloadErrored: boolean;
  filterDialogOpen: boolean;
}

// Data passed through navigation - the list is loaded only when it is present.
export interface GameListNavigationState {
  appliedTags: string[];
}

export interface IGameListActions {
  onChangeParameter<K extends keyof GameListParameters>(
    field: K,
    value: GameListParameters[K],
  ): void;
  onFilterSubmit(filterTags: string[]): void;
  onListReload(): void;
  onShowMore(): void;
  onOpenGameList(): void;
  onOpenFilterDialog(): void;
}

export interface IGameListWindows {
  showGameListView(navigationState: GameListNavigationState): void;
  showGameFilterDialog(): void;
}
