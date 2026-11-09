import { useEffect, useRef, useState } from 'react';
import { useMatch, useNavigate } from 'react-router';
import { apiClient } from '@api/apiClient';
import { env } from '@config/env';
import {
  GAME_CATEGORIES,
  type GameDefinitionViewModel,
  type GameMetadataDTO,
  type GameParametersErrors,
  type GameParametersForm,
  type IGameDefinitionActions,
  type IGameDefinitionWindows,
} from '@app-types/game';

// One route for a new and an existing game, so saving the first draft only
// changes :gameId and the view keeps its state.
const GAME_DEFINITION_PATTERN = '/creator/games/:gameId';
const NEW_GAME_ID = 'new';
const gameDefinitionPath = (gameId: string) => `/creator/games/${gameId}`;

const REQUIRED = 'Pole wymagane';

const initialForm: GameParametersForm = {
  title: '',
  description: '',
  category: '',
  minPlayers: '',
  maxPlayers: '',
  durationMinutes: '',
  requiresInvitation: false,
};

const initialState: GameDefinitionViewModel = {
  activePanelType: 'definition',
  activeGame: null,
  parametersForm: initialForm,
  validationErrors: {},
  isSubmitting: false,
  dialogType: null,
};

type SetState = React.Dispatch<React.SetStateAction<GameDefinitionViewModel>>;

function parsePositiveInt(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function validateParameters(form: GameParametersForm): GameParametersErrors {
  const errors: GameParametersErrors = {};

  if (!form.title.trim()) errors.title = REQUIRED;
  if (!form.description.trim()) errors.description = REQUIRED;
  if (!form.category) errors.category = REQUIRED;

  const minPlayers = parsePositiveInt(form.minPlayers);
  const maxPlayers = parsePositiveInt(form.maxPlayers);
  const duration = parsePositiveInt(form.durationMinutes);

  if (minPlayers === null) errors.minPlayers = 'Podaj liczbę większą od 0';
  if (maxPlayers === null) errors.maxPlayers = 'Podaj liczbę większą od 0';
  else if (minPlayers !== null && maxPlayers < minPlayers)
    errors.maxPlayers = 'Nie może być mniejsza niż minimalna';
  if (duration === null) errors.durationMinutes = 'Podaj liczbę większą od 0';

  return errors;
}

function toMetadata(
  form: GameParametersForm,
  previous: GameMetadataDTO | null,
): GameMetadataDTO {
  return {
    gameId: previous?.gameId ?? '',
    title: form.title.trim(),
    description: form.description.trim(),
    minPlayers: Number(form.minPlayers),
    maxPlayers: Number(form.maxPlayers),
    durationMinutes: Number(form.durationMinutes),
    requiresInvitation: form.requiresInvitation,
    tags: [form.category],
    status: previous?.status ?? 'W edycji',
  };
}

function toForm(game: GameMetadataDTO): GameParametersForm {
  return {
    title: game.title,
    description: game.description,
    category: GAME_CATEGORIES.find((c) => c === game.tags[0]) ?? '',
    minPlayers: String(game.minPlayers),
    maxPlayers: String(game.maxPlayers),
    durationMinutes: String(game.durationMinutes),
    requiresInvitation: game.requiresInvitation,
  };
}

// Draft save - a game that already has an id is updated (PUT), not created again.
function saveDraft(game: GameMetadataDTO): Promise<GameMetadataDTO> {
  const userId = env.devUserId;
  return game.gameId
    ? apiClient.games.editGame(game.gameId, userId, game, true)
    : apiClient.games.saveGame(userId, game, true);
}

function createGameDefinitionWindows(
  setState: SetState,
): IGameDefinitionWindows {
  return {
    showGameDefinitionView: () =>
      setState((prev) => ({
        ...prev,
        activePanelType: 'definition',
        dialogType: null,
      })),
    showGameParametersView: () =>
      setState((prev) => ({
        ...prev,
        activePanelType: 'parameters',
        dialogType: null,
      })),
    showParametersSavedMessageDialog: () =>
      setState((prev) => ({ ...prev, dialogType: 'parametersSaved' })),
    showIncorrectDataMessageDialog: () =>
      setState((prev) => ({ ...prev, dialogType: 'incorrectData' })),
    showGameSavedMessageDialog: () =>
      setState((prev) => ({ ...prev, dialogType: 'gameSaved' })),
    showGameSubmittedMessageDialog: () =>
      setState((prev) => ({ ...prev, dialogType: 'gameSubmitted' })),
    showSaveErrorMessageDialog: () =>
      setState((prev) => ({ ...prev, dialogType: 'saveError' })),
    showLoadErrorMessageDialog: () =>
      setState((prev) => ({ ...prev, dialogType: 'loadError' })),
  };
}

export function useGameDefinition(): {
  state: GameDefinitionViewModel;
  actions: IGameDefinitionActions;
} {
  const [state, setState] = useState<GameDefinitionViewModel>(initialState);
  const navigate = useNavigate();
  const windows = createGameDefinitionWindows(setState);

  const routeGameId = useMatch(GAME_DEFINITION_PATTERN)?.params.gameId;
  const gameId =
    routeGameId && routeGameId !== NEW_GAME_ID ? routeGameId : null;
  // Id of the game this hook has just saved - its data is already in state.
  const savedGameId = useRef<string | null>(null);

  // Only the definition route of an existing game loads data - other views
  // use this hook just to open the definition.
  useEffect(() => {
    if (!gameId || savedGameId.current === gameId) return;
    let cancelled = false;
    apiClient.games
      .getGame(gameId, env.devUserId)
      .then((game) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          activeGame: game,
          parametersForm: toForm(game),
        }));
      })
      .catch(() => {
        if (cancelled) return;
        createGameDefinitionWindows(setState).showLoadErrorMessageDialog();
      });
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  const onEditParameters = () => {
    setState((prev) => ({ ...prev, validationErrors: {} }));
    windows.showGameParametersView();
  };

  const onChangeParameter = <K extends keyof GameParametersForm>(
    field: K,
    value: GameParametersForm[K],
  ) => {
    setState((prev) => ({
      ...prev,
      parametersForm: { ...prev.parametersForm, [field]: value },
      validationErrors: { ...prev.validationErrors, [field]: undefined },
    }));
  };

  // Parameters are saved as a draft right away, so the game gets its id and
  // the use cases that need it (scenario, actions, ...) become available.
  const onSaveMetadata = async () => {
    if (state.isSubmitting) return;
    const errors = validateParameters(state.parametersForm);
    if (Object.keys(errors).length > 0) {
      setState((prev) => ({ ...prev, validationErrors: errors }));
      windows.showIncorrectDataMessageDialog();
      return;
    }
    const metadata = toMetadata(state.parametersForm, state.activeGame);
    setState((prev) => ({ ...prev, validationErrors: {}, isSubmitting: true }));
    try {
      const saved = await saveDraft(metadata);
      setState((prev) => ({ ...prev, activeGame: saved, isSubmitting: false }));
      if (!metadata.gameId) {
        savedGameId.current = saved.gameId;
        void navigate(gameDefinitionPath(saved.gameId), { replace: true });
      }
      windows.showParametersSavedMessageDialog();
    } catch {
      setState((prev) => ({ ...prev, isSubmitting: false }));
      windows.showSaveErrorMessageDialog();
    }
  };

  const saveGame = async (asDraft: boolean) => {
    const game = state.activeGame;
    if (!game) return;

    setState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      // Always saved as a draft first - submitting is a separate step.
      const saved = await saveDraft(game);
      setState((prev) => ({ ...prev, activeGame: saved }));
      if (!asDraft)
        await apiClient.games.submitToReviewer(saved.gameId, env.devUserId);
      setState((prev) => ({ ...prev, isSubmitting: false }));
      if (asDraft) windows.showGameSavedMessageDialog();
      else windows.showGameSubmittedMessageDialog();
    } catch {
      setState((prev) => ({ ...prev, isSubmitting: false }));
      windows.showSaveErrorMessageDialog();
    }
  };

  return {
    state,
    actions: {
      onCreateGame: () => void navigate(gameDefinitionPath(NEW_GAME_ID)),
      onOpenGame: (id) => void navigate(gameDefinitionPath(id)),
      onEditParameters,
      onChangeParameter,
      onSaveMetadata: () => void onSaveMetadata(),
      onParametersSavedMessageDialogConfirm: windows.showGameDefinitionView,
      onIncorrectDataMessageDialogConfirm: windows.showGameParametersView,
      onSaveDraft: () => void saveGame(true),
      onSubmitForReview: () => void saveGame(false),
      onSaveErrorMessageDialogConfirm: windows.showGameDefinitionView,
      onLoadErrorMessageDialogConfirm: () =>
        void navigate(gameDefinitionPath(NEW_GAME_ID), { replace: true }),
    },
  };
}
