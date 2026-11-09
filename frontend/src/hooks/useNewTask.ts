import { apiClient } from '@api/apiClient';
import { ApiError } from '@api/apiError';
import { env } from '@config/env';
import type {
  INewTaskActions,
  NewTaskViewModel,
  INewTaskWindows,
} from '@app-types/new-task';
import { useState } from 'react';
import { useNavigate, useParams, type NavigateFunction } from 'react-router';

function baseURL(gameId: string) {
  return `/creator/games/${gameId}/scenario`;
}

function newTaskURL(gameId: string) {
  return baseURL(gameId) + '/new-task';
}

// Step 4 - required fields are checked before anything is sent.
function isComplete(state: NewTaskViewModel): boolean {
  return [
    state.title,
    state.narrative,
    state.rewardType,
    state.rewardValue,
    state.interactionType,
  ].every((value) => value.trim() !== '');
}

function createNewTaskWindows(
  setViewModel: React.Dispatch<React.SetStateAction<NewTaskViewModel>>,
  navigate: NavigateFunction,
  gameId: string,
): INewTaskWindows {
  return {
    showNewTaskView: () => navigate(newTaskURL(gameId)),
    showCancelNewTaskConfirmationDialog: () => {
      setViewModel((vm) => ({
        ...vm,
        cancelNewTaskConfirmationDialogOpen: true,
      }));
    },
    showConflictMessageDialog: () => {
      setViewModel((vm) => ({ ...vm, conflictMessageDialogOpen: true }));
    },
    showIncorrectDataMessageDialog: () => {
      setViewModel((vm) => ({ ...vm, incorrectDataMessageDialogOpen: true }));
    },
    showNewTaskSuccessMessageDialog: () => {
      setViewModel((vm) => ({ ...vm, newTaskSuccessMessageDialogOpen: true }));
    },
    showSaveErrorMessageDialog: () => {
      setViewModel((vm) => ({ ...vm, saveErrorMessageDialogOpen: true }));
    },
    hideDialogs: () => {
      setViewModel((vm) => ({
        ...vm,
        newTaskSuccessMessageDialogOpen: false,
        cancelNewTaskConfirmationDialogOpen: false,
        conflictMessageDialogOpen: false,
        incorrectDataMessageDialogOpen: false,
        saveErrorMessageDialogOpen: false,
      }));
    },
  };
}

export function useNewTask(): {
  state: NewTaskViewModel;
  actions: INewTaskActions;
} {
  const { gameId } = useParams<{ gameId: string }>();
  if (gameId === undefined) throw 'useNewTask used outside of path with gameId';

  const [state, setState] = useState<NewTaskViewModel>({
    title: '',
    narrative: '',
    rewardType: '',
    rewardValue: '',
    requiredPlayerLevel: 0,
    interactionType: '',
    timeLimitMinutes: null,
    cancelNewTaskConfirmationDialogOpen: false,
    newTaskSuccessMessageDialogOpen: false,
    conflictMessageDialogOpen: false,
    incorrectDataMessageDialogOpen: false,
    saveErrorMessageDialogOpen: false,
  });

  const navigate = useNavigate();
  const {
    showNewTaskView,
    showCancelNewTaskConfirmationDialog,
    hideDialogs,
    showConflictMessageDialog,
    showIncorrectDataMessageDialog,
    showNewTaskSuccessMessageDialog,
    showSaveErrorMessageDialog,
  } = createNewTaskWindows(setState, navigate, gameId);

  const actions: INewTaskActions = {
    onNewTaskSelect: () => showNewTaskView(),

    onSubmitNewTask: async () => {
      if (!isComplete(state)) {
        showIncorrectDataMessageDialog();
        return;
      }
      try {
        await apiClient.scenario.addTask(gameId, env.devUserId, {
          title: state.title,
          narrative: state.narrative,
          interactionType: state.interactionType,
          requiredPlayerLevel: state.requiredPlayerLevel,
          timeLimitMinutes: state.timeLimitMinutes,
          rewardType: state.rewardType,
          rewardValue: state.rewardValue,
        });
        showNewTaskSuccessMessageDialog();
      } catch (e) {
        const status = e instanceof ApiError ? e.status : null;
        if (status === 409) {
          showConflictMessageDialog();
        } else if (status === 422) {
          showIncorrectDataMessageDialog();
        } else {
          showSaveErrorMessageDialog();
        }
      }
    },

    onCancelNewTask: () => showCancelNewTaskConfirmationDialog(),
    onCancelNewTaskConfirm: () => navigate(baseURL(gameId)),
    onCancelNewTaskCancel: () => hideDialogs(),
    onNewTaskSuccessMessageDialogConfirm: () => navigate(baseURL(gameId)),
    onIncorrectDataMessageDialogConfirm: () => hideDialogs(),
    onConflictMessageDialogConfirm: () => hideDialogs(),
    onSaveErrorMessageDialogConfirm: () => hideDialogs(),

    onChangeParameter: (field, value) => {
      setState({ ...state, [field]: value });
    },
  };

  return { state, actions };
}
