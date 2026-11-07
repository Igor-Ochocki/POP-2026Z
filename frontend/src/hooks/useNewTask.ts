import { apiClient } from '@api/apiClient';
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

function createNewTaskWindows(
  setViewModel: React.Dispatch<React.SetStateAction<NewTaskViewModel>>,
  navigate: NavigateFunction,
  gameId: string,
): INewTaskWindows {
  return {
    showNewTaskView: () => navigate(newTaskURL(gameId)),
    showCancelNewTaskConfirmationDialog: () => {
      setViewModel((vm) => ({ ...vm, confirmOpen: true }));
    },
    showConflictMessageDialog: () => {
      setViewModel((vm) => ({ ...vm, errorConflictOpen: true }));
    },
    showIncorrectDataMessageDialog: () => {
      setViewModel((vm) => ({ ...vm, errorIncorrectDataOpen: true }));
    },
    showNewTaskSuccessMessageDialog: () => {
      setViewModel((vm) => ({ ...vm, successOpen: true }));
    },
    hideDialogs: () => {
      setViewModel((vm) => ({
        ...vm,
        successOpen: false,
        confirmOpen: false,
        errorConflictOpen: false,
        errorIncorrectDataOpen: false,
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
    confirmOpen: false,
    successOpen: false,
    errorConflictOpen: false,
    errorIncorrectDataOpen: false,
  });

  const navigate = useNavigate();
  const {
    showNewTaskView,
    showCancelNewTaskConfirmationDialog,
    hideDialogs,
    showConflictMessageDialog,
    showIncorrectDataMessageDialog,
    showNewTaskSuccessMessageDialog,
  } = createNewTaskWindows(setState, navigate, gameId);

  const actions: INewTaskActions = {
    onNewTaskSelect: () => showNewTaskView(),

    onSubmitNewTask: async () => {
      try {
        await apiClient.scenario.addTask(gameId, state);
        showNewTaskSuccessMessageDialog();
      } catch (e) {
        const status = e as number;
        if (status === 409) {
          showConflictMessageDialog();
        } else if (status === 422) {
          showIncorrectDataMessageDialog();
        } else if (status === 404) {
          navigate('/creator/games');
        }
      }
    },

    onCancelNewTask: () => showCancelNewTaskConfirmationDialog(),
    onCancelNewTaskConfirm: () => navigate(baseURL(gameId)),
    onCancelNewTaskCancel: () => hideDialogs(),
    onNewTaskSuccessMessageDialogConfirm: () => navigate(baseURL(gameId)),
    onIncorrectDataMessageDialogConfirm: () => hideDialogs(),
    onConflictMessageDialogConfirm: () => hideDialogs(),

    onTitleChanged: (title) => {
      setState({ ...state, title });
    },
    onNarrativeChanged: (narrative: string) => {
      setState({ ...state, narrative });
    },
    onRewardTypeSelected: (rewardType: string) => {
      setState({ ...state, rewardType });
    },
    onRewardValueChanged: (rewardValue: string) => {
      setState({ ...state, rewardValue });
    },
    onRequiredPlayerLevelChanged: (requiredPlayerLevel: number) => {
      setState({ ...state, requiredPlayerLevel });
    },
    onInteractionTypeSelected: (interactionType: string) => {
      setState({ ...state, interactionType });
    },
    onTimeLimitMinutesChanged: (timeLimitMinutes: number) => {
      setState({ ...state, timeLimitMinutes });
    },
  };

  return { state, actions };
}
