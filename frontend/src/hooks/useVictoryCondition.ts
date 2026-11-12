import { apiClient } from '@api/apiClient';
import { ApiError } from '@api/apiError';
import { env } from '@config/env';
import type {
  IVictoryConditionActions,
  IVictoryConditionWindows,
  VictoryConditionTarget,
  VictoryConditionType,
  VictoryConditionViewModel,
} from '@app-types/victoryCondition';
import { useState } from 'react';
import { useNavigate, useParams, type NavigateFunction } from 'react-router';

function baseURL(gameId: string) {
  return `/creator/games/${gameId}/scenario`;
}

function victoryConditionURL(gameId: string) {
  return baseURL(gameId) + '/victory-condition';
}

function isComplete(
  state: VictoryConditionViewModel,
): state is VictoryConditionViewModel & {
  target: VictoryConditionTarget;
  conditionType: VictoryConditionType;
} {
  return (
    state.name.trim() !== '' &&
    state.value.trim() !== '' &&
    state.target !== null &&
    state.conditionType !== null
  );
}

function createVictoryConditionWindows(
  setViewModel: React.Dispatch<React.SetStateAction<VictoryConditionViewModel>>,
  navigate: NavigateFunction,
  gameId: string,
): IVictoryConditionWindows {
  return {
    showVictoryConditionView: () => navigate(victoryConditionURL(gameId)),
    showCancelVictoryConditionConfirmationDialog: () => {
      setViewModel((vm) => ({
        ...vm,
        cancelVictoryConditionConfirmationDialogOpen: true,
      }));
    },
    showConflictMessageDialog: () => {
      setViewModel((vm) => ({ ...vm, conflictMessageDialogOpen: true }));
    },
    showIncorrectDataMessageDialog: () => {
      setViewModel((vm) => ({ ...vm, incorrectDataMessageDialogOpen: true }));
    },
    showVictoryConditionSuccessMessageDialog: () => {
      setViewModel((vm) => ({
        ...vm,
        victoryConditionSuccessMessageDialogOpen: true,
      }));
    },
    showSaveErrorMessageDialog: () => {
      setViewModel((vm) => ({ ...vm, saveErrorMessageDialogOpen: true }));
    },
    hideDialogs: () => {
      setViewModel((vm) => ({
        ...vm,
        cancelVictoryConditionConfirmationDialogOpen: false,
        victoryConditionSuccessMessageDialogOpen: false,
        conflictMessageDialogOpen: false,
        incorrectDataMessageDialogOpen: false,
        saveErrorMessageDialogOpen: false,
      }));
    },
  };
}

export function useVictoryCondition(): {
  state: VictoryConditionViewModel;
  actions: IVictoryConditionActions;
} {
  const { gameId } = useParams<{ gameId: string }>();
  if (gameId === undefined)
    throw 'useVictoryCondition used outside of path with gameId';

  const [state, setState] = useState<VictoryConditionViewModel>({
    name: '',
    target: null,
    conditionType: null,
    value: '',
    cancelVictoryConditionConfirmationDialogOpen: false,
    victoryConditionSuccessMessageDialogOpen: false,
    conflictMessageDialogOpen: false,
    incorrectDataMessageDialogOpen: false,
    saveErrorMessageDialogOpen: false,
  });

  const navigate = useNavigate();
  const {
    showVictoryConditionView,
    showCancelVictoryConditionConfirmationDialog,
    showConflictMessageDialog,
    showIncorrectDataMessageDialog,
    showVictoryConditionSuccessMessageDialog,
    showSaveErrorMessageDialog,
    hideDialogs,
  } = createVictoryConditionWindows(setState, navigate, gameId);

  const actions: IVictoryConditionActions = {
    onVictoryConditionSelect: () => showVictoryConditionView(),

    onSubmitVictoryCondition: async () => {
      if (!isComplete(state)) {
        showIncorrectDataMessageDialog();
        return;
      }
      try {
        await apiClient.scenarios.addVictoryCondition(gameId, env.devUserId, {
          name: state.name,
          target: state.target,
          conditionType: state.conditionType,
          value: state.value,
        });
        showVictoryConditionSuccessMessageDialog();
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

    onCancelVictoryCondition: () =>
      showCancelVictoryConditionConfirmationDialog(),
    onCancelVictoryConditionConfirm: () => navigate(baseURL(gameId)),
    onCancelVictoryConditionCancel: () => hideDialogs(),
    onVictoryConditionSuccessMessageDialogConfirm: () =>
      navigate(baseURL(gameId)),
    onIncorrectDataMessageDialogConfirm: () => hideDialogs(),
    onConflictMessageDialogConfirm: () => hideDialogs(),
    onSaveErrorMessageDialogConfirm: () => hideDialogs(),

    onChangeParameter: (field, value) => {
      setState((vm) => ({ ...vm, [field]: value }));
    },
  };

  return { state, actions };
}
