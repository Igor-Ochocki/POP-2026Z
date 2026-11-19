import { apiClient } from '@api/apiClient';
import type {
  DisplayActionsViewModel,
  IDisplayActionsActions,
  IDisplayActionsWindows,
} from '@app-types/action';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, type NavigateFunction } from 'react-router';

function createDisplayActionsWindows(
  navigate: NavigateFunction,
  gameId: string,
): IDisplayActionsWindows {
  return {
    showDisplayActionsView: () => navigate(`/creator/games/${gameId}/actions`),
  };
}

export function useDisplayActions(): {
  state: DisplayActionsViewModel;
  actions: IDisplayActionsActions;
} {
  const { gameId } = useParams<{ gameId: string }>();
  if (gameId === undefined)
    throw 'useDisplayActions used outside of path with gameId';

  const navigate = useNavigate();
  const { showDisplayActionsView } = createDisplayActionsWindows(
    navigate,
    gameId,
  );

  const [state, setState] = useState<DisplayActionsViewModel>({
    actions: [],
    gameId,
  });

  useEffect(() => {
    (async () => {
      const actions = await apiClient.actions.getAll(gameId);
      setState({ ...state, actions });
    })();
  }, []);

  const actions: IDisplayActionsActions = {
    onDisplayActionsSelect: () => showDisplayActionsView(),
  };

  return { state, actions };
}
