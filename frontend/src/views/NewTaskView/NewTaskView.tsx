import './NewTaskView.css';
import Button from '@components/Button/Button';
import ConfirmDialog from '@components/ConfirmDialog/ConfirmDialog';
import DropdownField from '@components/DropdownField/DropdownField';
import ElementRow from '@components/ElementRow/ElementRow';
import InputField from '@components/InputField/InputField';
import MessageDialog from '@components/MessageDialog/MessageDialog';
import TextAreaField from '@components/TextAreaField/TextAreaField';
import TextHeading from '@components/TextHeading/TextHeading';
import TextSubheading from '@components/TextSubheading/TextSubheading';
import { useNewTask } from '@hooks/useNewTask';
import { useState } from 'react';

export function NewTaskView() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorConflictOpen, setErrorConflictOpen] = useState(false);
  const [errorIncorrectDataOpen, setErrorIncorrectDataOpen] = useState(false);

  const {
    state: {
      title,
      narrative,
      rewardType,
      rewardValue,
      requiredPlayerLevel,
      interactionType,
      timeLimitMinutes,
    },
    actions: {
      onSubmitNewTask,
      onCancelNewTask,
      onCancelNewTaskConfirm,
      onCancelNewTaskCancel,
      onNewTaskSuccessMessageDialogConfirm,
      onIncorrectDataMessageDialogConfirm,
      onConflictMessageDialogConfirm,
      onTitleChanged,
      onNarrativeChanged,
      onRewardTypeSelected,
      onRewardValueChanged,
      onRequiredPlayerLevelChanged,
      onInteractionTypeSelected,
      onTimeLimitMinutesChanged,
    },
  } = useNewTask({
    showNewTaskView: () => {
      setConfirmOpen(false);
      setSuccessOpen(false);
      setErrorConflictOpen(false);
      setErrorIncorrectDataOpen(false);
    },
    showCancelNewTaskConfirmationDialog: () => setConfirmOpen(true),
    showNewTaskSuccessMessageDialog: () => setSuccessOpen(true),
    showConflictMessageDialog: () => setErrorConflictOpen(true),
    showIncorrectDataMessageDialog: () => setErrorIncorrectDataOpen(true),
  });

  return (
    <div className='new-task-view'>
      <form
        className='new-task-form'
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitNewTask();
        }}
      >
        <TextHeading level={1}>Nowe zadanie</TextHeading>
        <div className='new-task-form__form-group'>
          <TextSubheading level={2}>Informacje podstawowe</TextSubheading>
          <InputField
            label='Tytuł'
            inputProps={{
              placeholder: 'Wprowadź tytuł...',
              value: title,
              onChange: (e) => onTitleChanged(e.target.value),
            }}
          />
          <TextAreaField
            label='Treść fabularna'
            textAreaProps={{
              placeholder: 'Wprowadź treść fabularną...',
              value: narrative,
              onChange: (e) => onNarrativeChanged(e.target.value),
            }}
          />
        </div>
        <div className='new-task-form__form-group'>
          <TextSubheading level={2}>Nagroda</TextSubheading>
          <DropdownField
            label='Typ nagrody'
            options={['foo', 'bar']}
            value={rewardType}
            onOptionSelected={onRewardTypeSelected}
          />
          <InputField
            label='Wartość'
            inputProps={{
              placeholder: 'Podaj wartość nagrody...',
              value: rewardValue,
              onChange: (e) => onRewardValueChanged(e.target.value),
            }}
          />
        </div>
        <div className='new-task-form__form-group'>
          <TextSubheading level={2}>Parametry techniczne</TextSubheading>
          <InputField
            label='Wymagany poziom gracza'
            inputProps={{
              placeholder: 'Wpisz poziom',
              type: 'number',
              value: requiredPlayerLevel,
              onChange: (e) => onRequiredPlayerLevelChanged(+e.target.value),
            }}
          />
          <DropdownField
            label='Typ interakcji'
            options={['foo', 'bar']}
            value={interactionType}
            onOptionSelected={onInteractionTypeSelected}
          />
          <InputField
            label='Ograniczenie czasowe (w minutach):'
            inputProps={{
              type: 'number',
              value: timeLimitMinutes ?? undefined,
              onChange: (e) => onTimeLimitMinutesChanged(+e.target.value),
            }}
          />
        </div>
        <ElementRow>
          <Button variant='secondary' onClick={onCancelNewTask}>
            Anuluj
          </Button>
          <Button type='submit'>Zapisz i zamknij</Button>
        </ElementRow>
        <ConfirmDialog
          dangerous
          title='Anuluj tworzenie zadania'
          message={`
            Czy aby na pewno anulować tworzenie zadania? Wprowadzone dane nie
            zostaną zapisane.
          `}
          open={confirmOpen}
          onClosed={(confirmed) => {
            if (confirmed) {
              onCancelNewTaskConfirm();
            } else {
              onCancelNewTaskCancel();
            }
          }}
        />
        <MessageDialog
          title='Sukces'
          message='Nowe zadanie zostało dodane.'
          onClosed={onNewTaskSuccessMessageDialogConfirm}
          open={successOpen}
        />
        <MessageDialog
          title='Błąd'
          message={`
            Podany obiekt interakcji posiada już powiązanie. Spróbuj wybrać inny
            obiekt interakcji
          `}
          onClosed={onConflictMessageDialogConfirm}
          open={errorConflictOpen}
        />
        <MessageDialog
          title='Błąd'
          message='Coś tam nie poszło'
          onClosed={onIncorrectDataMessageDialogConfirm}
          open={errorIncorrectDataOpen}
        />
      </form>
    </div>
  );
}
