import { useState } from 'react';
import { useNavigate, useParams, type NavigateFunction } from 'react-router';
import { apiClient } from '@api/apiClient';
import { ActionValidationError } from '@api/modules/actionsApi';
import type {
  ActionDefinitionViewModel,
  ActionDto,
  ActionForm,
  IActionDefinitionActions,
  IActionDefinitionWindows,
} from '@app-types/action';
 
const GAME_DEFINITION_PATH = '/creator/games/new';
 
function actionFormURL(gameId: string) {
  return `/creator/games/${gameId}/actions/new`;
}
 
const initialForm: ActionForm = {
  name: '',
  type: '',
  effectKind: '',
  effectValue: '',
};
 
function createActionDefinitionWindows(
  setState: React.Dispatch<React.SetStateAction<ActionDefinitionViewModel>>,
  navigate: NavigateFunction,
): IActionDefinitionWindows {
  return {
    showGameDefinitionView: () => {
      setState((prev) => ({
        ...prev,
        activePanelType: 'gameDefinition',
        dialogType: null,
      }));
      void navigate(GAME_DEFINITION_PATH);
    },
    showActionFormView: (gameId) => {
      setState((prev) => ({
        ...prev,
        activePanelType: 'actionForm',
        dialogType: null,
      }));
      void navigate(actionFormURL(gameId));
    },
    showActionSavedMessageDialog: () =>
      setState((prev) => ({ ...prev, dialogType: 'actionSaved' })),
    showIncompleteActionDataMessageDialog: () =>
      setState((prev) => ({ ...prev, dialogType: 'incompleteData' })),
    showActionSaveErrorMessageDialog: () =>
      setState((prev) => ({ ...prev, dialogType: 'saveError' })),
    hideDialogs: () => setState((prev) => ({ ...prev, dialogType: null })),
  };
}
 
export function useActionDefinition(): {
  state: ActionDefinitionViewModel;
  actions: IActionDefinitionActions;
} {
  const { gameId = '' } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
 
  const [state, setState] = useState<ActionDefinitionViewModel>({
    gameId,
    activePanelType: gameId ? 'actionForm' : 'gameDefinition',
    isSubmitting: false,
    dialogType: null,
    form: initialForm,
  });
 
  const windows = createActionDefinitionWindows(setState, navigate);
 
  const saveAction = async () => {
    setState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const created = await apiClient.actions.createAction(gameId, {
        gameId,
        ...state.form,
      } as ActionDto);
      if (!created.id) throw new Error('Brak identyfikatora zapisanej akcji');
      setState((prev) => ({ ...prev, isSubmitting: false }));
      windows.showActionSavedMessageDialog(); 
    } catch (e) {
      setState((prev) => ({ ...prev, isSubmitting: false }));
      if (e instanceof ActionValidationError) {
        windows.showIncompleteActionDataMessageDialog();
      } else {
        windows.showActionSaveErrorMessageDialog();
      }
    }
  };
 
  const actions: IActionDefinitionActions = {
    onAddAction: (targetGameId) => windows.showActionFormView(targetGameId), 
 
    onChangeParameter: (field, value) => {
      if (!(field in initialForm)) return;
      setState((prev) => ({
        ...prev,
        form: {
          ...prev.form,
          [field]: value,
          ...(field === 'effectKind' ? { effectValue: '' } : {}),
        },
      }));
    },
 
    onSaveAction: () => {
      if (state.isSubmitting) return;
      void saveAction();
    },
 
    onCancelActionDefinition: () => windows.showGameDefinitionView(),
 
    onActionSavedMessageDialogConfirm: () => windows.showGameDefinitionView(),
 
    onIncompleteActionDataMessageDialogConfirm: () => windows.hideDialogs(),
    onActionSaveErrorMessageDialogConfirm: () => windows.hideDialogs(),
  };
 
  return { state, actions };
}
