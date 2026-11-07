import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

type INewTaskActions = {
  onSubmitNewTask: () => void;
  onCancelNewTask: () => void;
  onCancelNewTaskConfirm: () => void;
  onCancelNewTaskCancel: () => void;
  onNewTaskSuccessMessageDialogConfirm: () => void;
  onIncorrectDataMessageDialogConfirm: () => void;
  onConflictMessageDialogConfirm: () => void;

  onTitleChanged: (title: string) => void;
  onNarrativeChanged: (narrative: string) => void;
  onRewardTypeSelected: (rewardType: string) => void;
  onRewardValueChanged: (rewardValue: string) => void;
  onRequiredPlayerLevelChanged: (requiredPlayerLevel: number) => void;
  onInteractionTypeSelected: (interactionType: string) => void;
  onTimeLimitMinutesChanged: (timeLimitMinutes: number) => void;
};

type INewTaskViewmodel = {
  title: string;
  narrative: string;
  rewardType: string;
  rewardValue: string;
  requiredPlayerLevel: number;
  interactionType: string;
  timeLimitMinutes: number | null;
};

type INewTaskWindows = {
  showNewTaskView: () => void;
  showCancelNewTaskConfirmationDialog: () => void;
  showConflictMessageDialog: () => void;
  showIncorrectDataMessageDialog: () => void;
  showNewTaskSuccessMessageDialog: () => void;
};

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

  const actions: INewTaskActions = {
    onSubmitNewTask: () => {
      showConflictMessageDialog();
    },

    onCancelNewTask: () => showCancelNewTaskConfirmationDialog(),
    onCancelNewTaskConfirm: () => navigate(`/creator/games/${gameId}/scenario`),
    onCancelNewTaskCancel: () => showNewTaskView(),
    onNewTaskSuccessMessageDialogConfirm: () =>
      navigate(`/creator/games/${gameId}/scenario`),
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
