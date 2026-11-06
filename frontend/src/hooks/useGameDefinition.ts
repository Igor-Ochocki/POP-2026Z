import { useState } from 'react';
import { useNavigate } from 'react-router';
import { apiClient } from '@api/apiClient';
import { useCreatorPanel } from '@hooks/useCreatorPanel';
import type {
  GameCreatePayload,
  GameDefinitionViewModel,
  GameMetadataDTO,
  GameParametersErrors,
  GameParametersForm,
  GameResponsePayload,
  IGameDefinitionActions,
  IGameDefinitionWindows,
} from '@app-types/game';

const GAME_DEFINITION_PATH = '/creator/games/new';
const GAME_LIST_PATH = '/creator/games';
const SENSOR_DEFINITION_PATH = '/creator/sensors/new';
const SCENARIO_EDITOR_PATH = '/creator/scenario';

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

function toCreatePayload(game: GameMetadataDTO): GameCreatePayload {
  return {
    title: game.title,
    description: game.description,
    min_players: game.minPlayers,
    max_players: game.maxPlayers,
    duration_minutes: game.durationMinutes,
    requires_invitation: game.requiresInvitation,
    tags: game.tags,
  };
}

function fromResponsePayload(data: GameResponsePayload): GameMetadataDTO {
  return {
    gameId: data.game_id,
    title: data.title,
    description: data.description,
    minPlayers: data.min_players,
    maxPlayers: data.max_players,
    durationMinutes: data.duration_minutes,
    requiresInvitation: data.requires_invitation,
    tags: data.tags,
    status: data.status,
  };
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
  };
}

export function useGameDefinition(): {
  state: GameDefinitionViewModel;
  actions: IGameDefinitionActions;
} {
  const [state, setState] = useState<GameDefinitionViewModel>(initialState);
  const navigate = useNavigate();
  const creatorPanel = useCreatorPanel();
  const windows = createGameDefinitionWindows(setState);

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
      setState((prev) => ({ ...prev, validationErrors: errors }));
      windows.showIncorrectDataMessageDialog();
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
    if (!game) return;

    setState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const saved = fromResponsePayload(
        await apiClient.games.saveGame(toCreatePayload(game), asDraft),
      );
      if (!asDraft) await apiClient.games.submitToReviewer(saved.gameId);
      setState((prev) => ({
        ...prev,
        activeGame: saved,
        isSubmitting: false,
      }));
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
      onCreateGame: () => void navigate(GAME_DEFINITION_PATH),
      onEditParameters,
      onChangeParameter,
      onSaveMetadata,
      onParametersSavedMessageDialogConfirm: windows.showGameDefinitionView,
      onIncorrectDataMessageDialogConfirm: windows.showGameParametersView,
      // TODO: PU50 onOpenSensorDefinition(gameId)
      onAddSensor: () => void navigate(SENSOR_DEFINITION_PATH),
      // TODO: PU56 onOpenScenarioEditor(gameId)
      onEditScenario: () => void navigate(SCENARIO_EDITOR_PATH),
      onSaveDraft: () => void saveGame(true),
      // TODO: PU25 onOpenGameList()
      onGameSavedMessageDialogConfirm: () => void navigate(GAME_LIST_PATH),
      onSubmitForReview: () => void saveGame(false),
      onGameSubmittedMessageDialogConfirm:
        creatorPanel.actions.onOpenCreatorPanel,
      onSaveErrorMessageDialogConfirm: windows.showGameDefinitionView,
      onCancelGameCreation: creatorPanel.actions.onOpenCreatorPanel,
    },
  };
}
