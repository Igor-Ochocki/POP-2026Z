import { apiClient } from '@api/apiClient';
import type {
  INewTaskActions,
  INewTaskViewmodel,
  INewTaskWindows,
} from '@app-types/new-task';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

export function useNewTask({
  showNewTaskView,
  showCancelNewTaskConfirmationDialog,
  showConflictMessageDialog,
  showIncorrectDataMessageDialog,
  showNewTaskSuccessMessageDialog,
}: INewTaskWindows): {
  state: INewTaskViewmodel;
  actions: INewTaskActions;
} {
  const [state, setState] = useState<INewTaskViewmodel>({
    title: '',
    narrative: '',
    rewardType: '',
    rewardValue: '',
    requiredPlayerLevel: 0,
    interactionType: '',
    timeLimitMinutes: null,
  });

  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const backURL = `/creator/games/${gameId}/scenario`;

  const actions: INewTaskActions = {
    onSubmitNewTask: async () => {
      if (gameId === undefined) throw "shouldn't happen?";
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
    onCancelNewTaskConfirm: () => navigate(backURL),
    onCancelNewTaskCancel: () => showNewTaskView(),
    onNewTaskSuccessMessageDialogConfirm: () => navigate(backURL),
    onIncorrectDataMessageDialogConfirm: () => showNewTaskView(),
    onConflictMessageDialogConfirm: () => showNewTaskView(),

    onTitleChanged: (title) => setState({ ...state, title }),
    onNarrativeChanged: (narrative: string) =>
      setState({ ...state, narrative }),
    onRewardTypeSelected: (rewardType: string) =>
      setState({ ...state, rewardType }),
    onRewardValueChanged: (rewardValue: string) =>
      setState({ ...state, rewardValue }),
    onRequiredPlayerLevelChanged: (requiredPlayerLevel: number) =>
      setState({ ...state, requiredPlayerLevel }),
    onInteractionTypeSelected: (interactionType: string) =>
      setState({ ...state, interactionType }),
    onTimeLimitMinutesChanged: (timeLimitMinutes: number) =>
      setState({ ...state, timeLimitMinutes }),
  };

  return { state, actions };
}
