import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiClient } from '@api/apiClient';
import type {
  GameDefinitionDialog,
  GameDefinitionViewModel,
  GameMetadataDTO,
  GameParametersErrors,
  GameParametersForm,
  IGameDefinitionActions,
} from '@app-types/game';

const CREATOR_PANEL_PATH = '/creator';
// TODO: change to the game list route once it exists (PU53)
const GAME_LIST_PATH = CREATOR_PANEL_PATH;

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
  isDirty: false,
  isSubmitting: false,
  dialog: null,
};

const invalidDataDialog: GameDefinitionDialog = {
  title: 'Błąd',
  message: 'Podane dane są błędne',
  redirectTo: null,
};

const notAvailableDialog: GameDefinitionDialog = {
  title: 'Informacja',
  message: 'Ta funkcja będzie dostępna wkrótce',
  redirectTo: null,
};

function parsePositiveInt(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return parsed > 0 ? parsed : null;
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

export function useGameDefinition(): {
  state: GameDefinitionViewModel;
  actions: IGameDefinitionActions;
} {
  const [state, setState] = useState<GameDefinitionViewModel>(initialState);
  const navigate = useNavigate();

  const showDialog = useCallback((dialog: GameDefinitionDialog) => {
    setState((prev) => ({ ...prev, dialog }));
  }, []);

  const onEditParameters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activePanel: 'parameters',
      validationErrors: {},
    }));
  }, []);

  const onChangeParameter = useCallback(
    <K extends keyof GameParametersForm>(
      field: K,
      value: GameParametersForm[K],
    ) => {
      setState((prev) => ({
        ...prev,
        parametersForm: { ...prev.parametersForm, [field]: value },
        validationErrors: { ...prev.validationErrors, [field]: undefined },
      }));
    },
    [],
  );

  const onSaveMetadata = useCallback(() => {
    setState((prev) => {
      const errors = validateParameters(prev.parametersForm);
      if (Object.keys(errors).length > 0) {
        return { ...prev, validationErrors: errors, dialog: invalidDataDialog };
      }
      return {
        ...prev,
        activeGame: toMetadata(prev.parametersForm, prev.activeGame),
        validationErrors: {},
        isDirty: true,
        dialog: {
          title: 'Sukces',
          message: 'Poprawnie zapisano parametry',
          redirectTo: null,
          returnToDefinition: true,
        },
      };
    });
  }, []);

  const saveGame = useCallback(
    async (asDraft: boolean) => {
      const game = state.activeGame;
      if (!game) return;

      setState((prev) => ({ ...prev, isSubmitting: true }));
      try {
        const saved = await apiClient.games.saveGame(game, asDraft);
        if (!asDraft) await apiClient.games.submitToReviewer(saved.gameId);
        setState((prev) => ({
          ...prev,
          activeGame: saved,
          isDirty: false,
          isSubmitting: false,
          dialog: asDraft
            ? {
                title: 'Sukces',
                message: 'Poprawnie zapisano grę',
                redirectTo: GAME_LIST_PATH,
              }
            : {
                title: 'Sukces',
                message: 'Poprawnie zapisano grę i wysłano do recenzenta',
                redirectTo: CREATOR_PANEL_PATH,
              },
        }));
      } catch {
        setState((prev) => ({
          ...prev,
          isSubmitting: false,
          dialog: {
            title: 'Błąd',
            message: 'Nie udało się zapisać gry. Spróbuj ponownie.',
            redirectTo: null,
          },
        }));
      }
    },
    [state.activeGame],
  );

  const onSaveDraft = useCallback(() => void saveGame(true), [saveGame]);

  const onSubmitForReview = useCallback(() => void saveGame(false), [saveGame]);

  const onCancelGameCreation = useCallback(() => {
    void navigate(CREATOR_PANEL_PATH);
  }, [navigate]);

  // TODO: open editors from PU56 / PU60 / PU51 once they are implemented
  const onOpenScenarioEditor = useCallback(
    () => showDialog(notAvailableDialog),
    [showDialog],
  );
  const onOpenMapEditor = useCallback(
    () => showDialog(notAvailableDialog),
    [showDialog],
  );
  const onOpenActionDefinition = useCallback(
    () => showDialog(notAvailableDialog),
    [showDialog],
  );

  const onCloseDialog = useCallback(() => {
    const dialog = state.dialog;
    if (!dialog) return;

    setState((prev) => ({
      ...prev,
      dialog: null,
      activePanel: dialog.returnToDefinition ? 'definition' : prev.activePanel,
    }));
    if (dialog.redirectTo) void navigate(dialog.redirectTo);
  }, [state.dialog, navigate]);

  return {
    state,
    actions: {
      onEditParameters,
      onChangeParameter,
      onSaveMetadata,
      onSaveDraft,
      onSubmitForReview,
      onCancelGameCreation,
      onOpenScenarioEditor,
      onOpenMapEditor,
      onOpenActionDefinition,
      onCloseDialog,
    },
  };
}
