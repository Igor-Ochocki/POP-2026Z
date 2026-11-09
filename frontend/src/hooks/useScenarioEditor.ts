import { useEffect, useState } from 'react';
import { useNavigate, useParams, type NavigateFunction } from 'react-router';
import { apiClient } from '@api/apiClient';
import { env } from '@config/env';
import type {
  IScenarioEditorActions,
  IScenarioEditorWindows,
  ScenarioEditorViewModel,
} from '@app-types/scenarioEditor';

const LOAD_ERROR = 'Nie udało się wczytać scenariusza. Spróbuj ponownie.';

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
    apiClient.scenario.loadScenario(gameId, userId),
  ]);
  return { activeGame, scenario };
}

export function useScenarioEditor(): {
  state: ScenarioEditorViewModel;
  actions: IScenarioEditorActions;
} {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const windows = createScenarioEditorWindows(navigate);
  const [reloadCount, setReloadCount] = useState(0);
  const [state, setState] = useState<ScenarioEditorViewModel>(() => ({
    activeGame: null,
    scenario: null,
    isLoading: Boolean(gameId),
    errorMessage: null,
  }));

  // Only the editor route has :gameId - other views use this hook just to
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
    state,
    actions: {
      onOpenScenarioEditor: windows.showScenarioEditorView,
      onReloadScenario: () => {
        setState((prev) => ({ ...prev, isLoading: true, errorMessage: null }));
        setReloadCount((count) => count + 1);
      },
    },
  };
}
