import { useEffect, useState } from 'react';
import { useMatch, useNavigate, type NavigateFunction } from 'react-router';
import { apiClient } from '@api/apiClient';
import { env } from '@config/env';
import type {
  IScenarioEditorActions,
  IScenarioEditorWindows,
  ScenarioEditorViewModel,
} from '@app-types/scenarioEditor';

const LOAD_ERROR = 'Nie udało się wczytać scenariusza. Spróbuj ponownie.';

const SCENARIO_EDITOR_PATTERN = '/creator/games/:gameId/scenario';

const scenarioEditorPath = (gameId: string) =>
  `/creator/games/${gameId}/scenario`;

function createScenarioEditorWindows(
  navigate: NavigateFunction,
): IScenarioEditorWindows {
  return {
    showScenarioEditorView: (gameId) =>
      void navigate(scenarioEditorPath(gameId)),
  };
}

async function fetchEditorData(gameId: string) {
  const userId = env.devUserId;
  const [activeGame, scenario] = await Promise.all([
    apiClient.games.getGame(gameId, userId),
    apiClient.scenarios.loadScenario(gameId, userId),
  ]);
  return { activeGame, scenario };
}

export function useScenarioEditor(): {
  state: ScenarioEditorViewModel;
  actions: IScenarioEditorActions;
} {
  const gameId = useMatch(SCENARIO_EDITOR_PATTERN)?.params.gameId ?? null;
  const navigate = useNavigate();
  const windows = createScenarioEditorWindows(navigate);
  const [reloadCount, setReloadCount] = useState(0);
  const [state, setState] = useState<ScenarioEditorViewModel>(() => ({
    gameId,
    activeGame: null,
    scenario: null,
    isLoading: Boolean(gameId),
    errorMessage: null,
  }));

  // Only the editor route loads data - other views use this hook just to
  // open the editor, so they never call the API.
  useEffect(() => {
    if (!gameId) return;
    let cancelled = false;
    fetchEditorData(gameId)
      .then(({ activeGame, scenario }) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          activeGame,
          scenario,
          isLoading: false,
        }));
      })
      .catch(() => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          errorMessage: LOAD_ERROR,
        }));
      });
    return () => {
      cancelled = true;
    };
  }, [gameId, reloadCount]);

  return {
    state: { ...state, gameId },
    actions: {
      onOpenScenarioEditor: windows.showScenarioEditorView,
      onReloadScenario: () => {
        setState((prev) => ({ ...prev, isLoading: true, errorMessage: null }));
        setReloadCount((count) => count + 1);
      },
    },
  };
}
