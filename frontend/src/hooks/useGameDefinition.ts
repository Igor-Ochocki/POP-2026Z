import { useState } from 'react';
import { useLocation, useNavigate, type NavigateFunction } from 'react-router';
import { apiClient } from '@api/apiClient';
import type {
  GameDefinitionViewModel,
  GameCategory,
  GameMetadataDTO,
  GameParametersErrors,
  GameParametersForm,
  IGameDefinitionActions,
  IGameDefinitionWindows,
} from '@app-types/game';

const CREATOR_PANEL_PATH = '/creator';
const GAME_LIST_PATH = '/creator/games';
const SENSOR_DEFINITION_PATH = '/creator/sensors/new';

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
  activePanel: 'definition',
  activeGame: null,
  parametersForm: initialForm,
  validationErrors: {},
  isSubmitting: false,
  dialog: null,
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

function createGameDefinitionWindows(
  setState: SetState,
  navigate: NavigateFunction,
): IGameDefinitionWindows {
  return {
    showCreatorPanelView: () => void navigate(CREATOR_PANEL_PATH),
    showGameListView: () => void navigate(GAME_LIST_PATH),
    showGameDefinitionView: () =>
      setState((prev) => ({
        ...prev,
        activePanel: 'definition',
        dialog: null,
      })),
    showGameParametersView: () =>
      setState((prev) => ({
        ...prev,
        activePanel: 'parameters',
        dialog: null,
      })),
    showSensorDefinitionView: () => void navigate(SENSOR_DEFINITION_PATH),
    showParametersSavedMessageDialog: () =>
      setState((prev) => ({ ...prev, dialog: 'parametersSaved' })),
    showIncorrectDataMessageDialog: (errors) =>
      setState((prev) => ({
        ...prev,
        validationErrors: errors,
        dialog: 'incorrectData',
      })),
    showGameSavedMessageDialog: () =>
      setState((prev) => ({ ...prev, dialog: 'gameSaved' })),
    showGameSubmittedMessageDialog: () =>
      setState((prev) => ({ ...prev, dialog: 'gameSubmitted' })),
    showSaveErrorMessageDialog: () =>
      setState((prev) => ({ ...prev, dialog: 'saveError' })),
    showSubmitErrorMessageDialog: () =>
      setState((prev) => ({ ...prev, dialog: 'submitError' })),
  };
}

export function useGameDefinition(): {
  state: GameDefinitionViewModel;
  actions: IGameDefinitionActions;
} {
  const navigate = useNavigate();
  const location = useLocation();
  const restoredGame = (
    location.state as { activeGame?: GameMetadataDTO } | null
  )?.activeGame;
  const [state, setState] = useState<GameDefinitionViewModel>(() =>
    restoredGame
      ? {
          ...initialState,
          activeGame: restoredGame,
          parametersForm: {
            ...initialForm,
            title: restoredGame.title,
            description: restoredGame.description,
            category: (restoredGame.tags[0] as GameCategory | undefined) ?? '',
            minPlayers: String(restoredGame.minPlayers),
            maxPlayers: String(restoredGame.maxPlayers),
            durationMinutes: String(restoredGame.durationMinutes),
            requiresInvitation: restoredGame.requiresInvitation,
          },
        }
      : initialState,
  );
  const windows = createGameDefinitionWindows(setState, navigate);

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

  const onSaveMetadata = () => {
    const errors = validateParameters(state.parametersForm);
    if (Object.keys(errors).length > 0) {
      windows.showIncorrectDataMessageDialog(errors);
      return;
    }
    setState((prev) => ({
      ...prev,
      activeGame: toMetadata(prev.parametersForm, prev.activeGame),
      validationErrors: {},
    }));
    windows.showParametersSavedMessageDialog();
  };

  const saveGame = async (asDraft: boolean) => {
    const game = state.activeGame;
    if (!game || state.isSubmitting || (asDraft && game.gameId)) return;

    setState((prev) => ({ ...prev, isSubmitting: true }));
    let saved = game;
    if (!game.gameId) {
      try {
        saved = await apiClient.games.saveGame(game, asDraft);
        setState((prev) => ({ ...prev, activeGame: saved }));
      } catch {
        setState((prev) => ({ ...prev, isSubmitting: false }));
        windows.showSaveErrorMessageDialog();
        return;
      }
    }

    if (asDraft) {
      setState((prev) => ({ ...prev, isSubmitting: false }));
      windows.showGameSavedMessageDialog();
      return;
    }

    try {
      const submitted = await apiClient.games.submitToReviewer(saved.gameId);
      if (!submitted) throw new Error('Game submission was rejected.');
      setState((prev) => ({ ...prev, isSubmitting: false }));
      windows.showGameSubmittedMessageDialog();
    } catch {
      setState((prev) => ({ ...prev, isSubmitting: false }));
      windows.showSubmitErrorMessageDialog();
    }
  };

  return {
    state,
    actions: {
      onEditParameters,
      onChangeParameter,
      onSaveMetadata,
      onParametersSavedMessageDialogConfirm: windows.showGameDefinitionView,
      onIncorrectDataMessageDialogConfirm: windows.showGameParametersView,
      onAddSensor: windows.showSensorDefinitionView,
      onSaveDraft: () => void saveGame(true),
      onGameSavedMessageDialogConfirm: windows.showGameDefinitionView,
      onSubmitForReview: () => void saveGame(false),
      onGameSubmittedMessageDialogConfirm: windows.showCreatorPanelView,
      onSaveErrorMessageDialogConfirm: windows.showGameDefinitionView,
      onCancelGameCreation: windows.showCreatorPanelView,
    },
  };
}
