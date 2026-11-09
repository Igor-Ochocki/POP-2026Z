import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { apiClient } from '@api/apiClient';
import type {
  GameMetadataDTO,
  IScenarioEditorActions,
  IScenarioEditorWindows,
  ScenarioEditorViewModel,
} from '@app-types/game';

function createScenarioEditorWindows(
  navigate: ReturnType<typeof useNavigate>,
  currentPath: string,
): IScenarioEditorWindows {
  return {
    showGameDefinitionView: (activeGame) =>
      void navigate('/creator/games/new', { state: { activeGame } }),
    showScenarioEditorView: async (game) => {
      await navigate(currentPath, {
        replace: true,
        state: { activeGame: game },
      });
      await navigate(`/creator/games/${game.gameId}/scenario`, {
        state: { activeGame: game },
      });
    },
  };
}

export function useScenarioEditor(): {
  state: ScenarioEditorViewModel;
  actions: IScenarioEditorActions;
} {
  const { gameId } = useParams<{ gameId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const activeGame =
    (location.state as { activeGame?: GameMetadataDTO } | null)?.activeGame ??
    null;
  const [state, setState] = useState<ScenarioEditorViewModel>({
    activeGame,
    scenario: null,
    isLoading: Boolean(gameId),
    errorMessage: null,
  });
  const windows = createScenarioEditorWindows(
    navigate,
    location.pathname + location.search + location.hash,
  );

  const loadScenario = useCallback(async (targetGameId: string) => {
    if (!targetGameId) {
      setState((previous) => ({
        ...previous,
        isLoading: false,
        errorMessage: 'Nie podano identyfikatora gry.',
      }));
      return;
    }

    setState((previous) => ({
      ...previous,
      isLoading: true,
      errorMessage: null,
    }));
    try {
      const scenario = await apiClient.scenarios.loadScenario(targetGameId);
      setState((previous) => ({
        ...previous,
        scenario,
        isLoading: false,
        errorMessage: null,
      }));
    } catch {
      setState((previous) => ({
        ...previous,
        scenario: null,
        isLoading: false,
        errorMessage: 'Nie udało się wczytać scenariusza. Spróbuj ponownie.',
      }));
    }
  }, []);

  useEffect(() => {
    if (gameId) void loadScenario(gameId);
  }, [gameId, loadScenario]);

  return {
    state,
    actions: {
      onOpenScenarioEditor: (game) => void windows.showScenarioEditorView(game),
      onRetryLoadScenario: () => void loadScenario(gameId ?? ''),
      onAddTask: () => undefined,
      onAddVictoryCondition: () => undefined,
      onCloseScenarioEditor: () =>
        windows.showGameDefinitionView(state.activeGame),
    },
  };
}
