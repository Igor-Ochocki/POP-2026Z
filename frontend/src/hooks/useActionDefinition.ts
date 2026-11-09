import { useState } from 'react';
import { useNavigate, useParams, type NavigateFunction } from 'react-router';
import { apiClient } from '@api/apiClient';
import { ApiError } from '@api/apiError';
import type {
  ActionCreateDTO,
  ActionDefinitionViewModel,
  ActionForm,
  IActionDefinitionActions,
  IActionDefinitionWindows,
} from '@app-types/action';

const actionDefinitionPath = (gameId: string) =>
  `/creator/games/${gameId}/actions/new`;

const initialForm: ActionForm = {
  name: '',
  actionType: '',
  outcomeType: '',
  outcomeValue: '',
};

type SetState = React.Dispatch<React.SetStateAction<ActionDefinitionViewModel>>;

function toCreateDTO(gameId: string, form: ActionForm): ActionCreateDTO | null {
  const name = form.name.trim();
  const outcomeValue = form.outcomeValue.trim();
  if (!name || !form.actionType || !form.outcomeType || !outcomeValue)
    return null;
  return {
    gameId,
    name,
    actionType: form.actionType,
    outcomeType: form.outcomeType,
    outcomeValue,
  };
}

function createActionDefinitionWindows(
  setState: SetState,
  navigate: NavigateFunction,
): IActionDefinitionWindows {
  return {
    showActionDefinitionView: (gameId) =>
      void navigate(actionDefinitionPath(gameId)),
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
    form: initialForm,
    isSubmitting: false,
    dialogType: null,
  });
  const windows = createActionDefinitionWindows(setState, navigate);

  const saveAction = async (action: ActionCreateDTO) => {
    setState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await apiClient.actions.createAction(action);
      setState((prev) => ({ ...prev, isSubmitting: false }));
      windows.showActionSavedMessageDialog();
    } catch (e) {
      setState((prev) => ({ ...prev, isSubmitting: false }));
      if (e instanceof ApiError && e.status === 422)
        windows.showIncompleteActionDataMessageDialog();
      else windows.showActionSaveErrorMessageDialog();
    }
  };

  return {
    state,
    actions: {
      onAddAction: windows.showActionDefinitionView,
      onChangeParameter: (field, value) =>
        setState((prev) => ({
          ...prev,
          form: { ...prev.form, [field]: value },
        })),
      onSaveAction: () => {
        if (state.isSubmitting) return;
        const action = toCreateDTO(state.gameId, state.form);
        if (!action) {
          windows.showIncompleteActionDataMessageDialog();
          return;
        }
        void saveAction(action);
      },
      onIncompleteActionDataMessageDialogConfirm: windows.hideDialogs,
      onActionSaveErrorMessageDialogConfirm: windows.hideDialogs,
    },
  };
}
