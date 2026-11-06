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
): IScenarioEditorWindows {
  return {
    showGameDefinitionView: (activeGame) =>
      void navigate('/creator/games/new', { state: { activeGame } }),
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
  const windows = createScenarioEditorWindows(navigate);

  const onOpenScenarioEditor = useCallback(async (targetGameId: string) => {
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
    void onOpenScenarioEditor(gameId ?? '');
  }, [gameId, onOpenScenarioEditor]);

  return {
    state,
    actions: {
      onOpenScenarioEditor: (targetGameId) =>
        void onOpenScenarioEditor(targetGameId),
      onAddTask: () => undefined,
      onAddVictoryCondition: () => undefined,
      onCloseScenarioEditor: () =>
        windows.showGameDefinitionView(state.activeGame),
    },
  };
}
