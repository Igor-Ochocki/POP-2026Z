export type IGameListActions = {
  onChangeParameter: (field: string, value: any) => void,
  onFilterSubmit: (filterTags: string[]) => void,
  onListReload: () => void;
  onShowMore: () => void;
  onOpenGameList: () => void;
  onOpenFilterDialog: () => void;
};

export type IGameListWindows = {
  showGameListView: () => void;
  showGameFilterDialog: () => void;
}