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
import { useEffect, useState } from 'react';
import {
  useMatch,
  useNavigate,
  useParams,
  type NavigateFunction,
} from 'react-router';

const VICTORY_CONDITION_EDIT_PATTERN =
  '/creator/games/:gameId/scenario/victory-condition/:victoryConditionId';

function baseURL(gameId: string) {
  return `/creator/games/${gameId}/scenario`;
}

function victoryConditionURL(gameId: string) {
  return baseURL(gameId) + '/victory-condition';
}

function victoryConditionEditURL(gameId: string, victoryConditionId: string) {
  return victoryConditionURL(gameId) + `/${victoryConditionId}`;
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
    showVictoryConditionEditView: (victoryConditionId) =>
      navigate(victoryConditionEditURL(gameId, victoryConditionId)),
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
    showLoadErrorMessageDialog: () => {
      setViewModel((vm) => ({ ...vm, loadErrorMessageDialogOpen: true }));
    },
    hideDialogs: () => {
      setViewModel((vm) => ({
        ...vm,
        cancelVictoryConditionConfirmationDialogOpen: false,
        victoryConditionSuccessMessageDialogOpen: false,
        conflictMessageDialogOpen: false,
        incorrectDataMessageDialogOpen: false,
        saveErrorMessageDialogOpen: false,
        loadErrorMessageDialogOpen: false,
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

  // Only the edit route loads a condition - the editor uses this hook just to
  // open the form, so it never calls the API.
  const editedId =
    useMatch(VICTORY_CONDITION_EDIT_PATTERN)?.params.victoryConditionId ?? null;

  const [state, setState] = useState<VictoryConditionViewModel>({
    victoryConditionId: editedId,
    isLoading: editedId !== null,
    name: '',
    target: null,
    conditionType: null,
    value: '',
    cancelVictoryConditionConfirmationDialogOpen: false,
    victoryConditionSuccessMessageDialogOpen: false,
    conflictMessageDialogOpen: false,
    incorrectDataMessageDialogOpen: false,
    saveErrorMessageDialogOpen: false,
    loadErrorMessageDialogOpen: false,
  });

  const navigate = useNavigate();
  const {
    showVictoryConditionView,
    showVictoryConditionEditView,
    showCancelVictoryConditionConfirmationDialog,
    showConflictMessageDialog,
    showIncorrectDataMessageDialog,
    showVictoryConditionSuccessMessageDialog,
    showSaveErrorMessageDialog,
    hideDialogs,
  } = createVictoryConditionWindows(setState, navigate, gameId);

  useEffect(() => {
    if (editedId === null) return;
    let cancelled = false;
    const loadVictoryCondition = async (victoryConditionId: string) => {
      try {
        const condition = await apiClient.scenarios.getVictoryCondition(
          gameId,
          victoryConditionId,
          env.devUserId,
        );
        if (cancelled) return;
        setState((vm) => ({
          ...vm,
          name: condition.name,
          target: condition.target,
          conditionType: condition.conditionType,
          value: condition.value,
          isLoading: false,
        }));
      } catch {
        if (cancelled) return;
        setState((vm) => ({ ...vm, isLoading: false }));
        createVictoryConditionWindows(
          setState,
          navigate,
          gameId,
        ).showLoadErrorMessageDialog();
      }
    };
    void loadVictoryCondition(editedId);
    return () => {
      cancelled = true;
    };
  }, [gameId, editedId, navigate]);

  const actions: IVictoryConditionActions = {
    onVictoryConditionSelect: () => showVictoryConditionView(),
    onVictoryConditionEditSelect: (victoryConditionId) =>
      showVictoryConditionEditView(victoryConditionId),

    onSubmitVictoryCondition: async () => {
      if (!isComplete(state)) {
        showIncorrectDataMessageDialog();
        return;
      }
      const victoryCondition = {
        name: state.name,
        target: state.target,
        conditionType: state.conditionType,
        value: state.value,
      };
      try {
        if (state.victoryConditionId === null) {
          await apiClient.scenarios.addVictoryCondition(
            gameId,
            env.devUserId,
            victoryCondition,
          );
        } else {
          await apiClient.scenarios.editVictoryCondition(
            gameId,
            state.victoryConditionId,
            env.devUserId,
            victoryCondition,
          );
        }
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
    onLoadErrorMessageDialogConfirm: () => navigate(baseURL(gameId)),

    onChangeParameter: (field, value) => {
      setState((vm) => ({ ...vm, [field]: value }));
    },
  };

  return { state, actions };
}
