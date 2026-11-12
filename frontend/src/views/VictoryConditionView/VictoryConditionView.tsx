import './VictoryConditionView.css';
import Button from '@components/Button/Button';
import ConfirmDialog from '@components/ConfirmDialog/ConfirmDialog';
import DropdownField from '@components/DropdownField/DropdownField';
import ElementRow from '@components/ElementRow/ElementRow';
import InputField from '@components/InputField/InputField';
import MessageDialog from '@components/MessageDialog/MessageDialog';
import TextHeading from '@components/TextHeading/TextHeading';
import { useVictoryCondition } from '@hooks/useVictoryCondition';
import {
  victoryConditionTargetLabels,
  victoryConditionTypeLabels,
} from '@app-types/victoryCondition';

function keyByLabel<T extends string>(
  labels: Record<T, string>,
  label: string,
): T | null {
  return (Object.keys(labels) as T[]).find((k) => labels[k] === label) ?? null;
}

export function VictoryConditionView() {
  const {
    state: {
      name,
      target,
      conditionType,
      value,
      cancelVictoryConditionConfirmationDialogOpen,
      victoryConditionSuccessMessageDialogOpen,
      conflictMessageDialogOpen,
      incorrectDataMessageDialogOpen,
      saveErrorMessageDialogOpen,
    },
    actions: {
      onSubmitVictoryCondition,
      onCancelVictoryCondition,
      onCancelVictoryConditionConfirm,
      onCancelVictoryConditionCancel,
      onVictoryConditionSuccessMessageDialogConfirm,
      onIncorrectDataMessageDialogConfirm,
      onConflictMessageDialogConfirm,
      onSaveErrorMessageDialogConfirm,
      onChangeParameter,
    },
  } = useVictoryCondition();

  return (
    <div className='victory-condition-view'>
      <form
        className='victory-condition-form'
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitVictoryCondition();
        }}
      >
        <TextHeading level={1}>Warunek zwycięstwa</TextHeading>
        <InputField
          label='Nazwa warunku'
          inputProps={{
            placeholder: 'Wprowadź nazwę...',
            value: name,
            onChange: (e) => onChangeParameter('name', e.target.value),
          }}
        />
        <DropdownField
          label='Frakcja/Postać'
          options={Object.values(victoryConditionTargetLabels)}
          value={target ? victoryConditionTargetLabels[target] : undefined}
          onOptionSelected={(option) =>
            onChangeParameter(
              'target',
              keyByLabel(victoryConditionTargetLabels, option),
            )
          }
        />
        <DropdownField
          label='Typ warunku'
          options={Object.values(victoryConditionTypeLabels)}
          value={
            conditionType
              ? victoryConditionTypeLabels[conditionType]
              : undefined
          }
          onOptionSelected={(option) =>
            onChangeParameter(
              'conditionType',
              keyByLabel(victoryConditionTypeLabels, option),
            )
          }
        />
        <InputField
          label='Wartość'
          inputProps={{
            placeholder: 'Podaj wartość...',
            value: value,
            onChange: (e) => onChangeParameter('value', e.target.value),
          }}
        />
        <ElementRow>
          <Button variant='secondary' onClick={onCancelVictoryCondition}>
            Anuluj
          </Button>
          <Button type='submit'>Zapisz i zamknij</Button>
        </ElementRow>
        <ConfirmDialog
          dangerous
          title='Anuluj tworzenie warunku zwycięstwa'
          message={`
            Czy aby na pewno anulować tworzenie warunku zwycięstwa? Wprowadzone
            dane nie zostaną zapisane.
          `}
          open={cancelVictoryConditionConfirmationDialogOpen}
          onClosed={(confirmed) => {
            if (confirmed) {
              onCancelVictoryConditionConfirm();
            } else {
              onCancelVictoryConditionCancel();
            }
          }}
        />
        <MessageDialog
          title='Sukces'
          message='Nowy warunek zwycięstwa został dodany.'
          onClosed={onVictoryConditionSuccessMessageDialogConfirm}
          open={victoryConditionSuccessMessageDialogOpen}
        />
        <MessageDialog
          title='Błąd'
          message='Podane dane warunku zwycięstwa są błędne.'
          onClosed={onIncorrectDataMessageDialogConfirm}
          open={incorrectDataMessageDialogOpen}
        />
        <MessageDialog
          title='Konflikt danych'
          message='Już istnieje warunek zwycięstwa tego typu.'
          onClosed={onConflictMessageDialogConfirm}
          open={conflictMessageDialogOpen}
        />
        <MessageDialog
          title='Błąd'
          message='Nie udało się zapisać warunku zwycięstwa. Spróbuj ponownie.'
          onClosed={onSaveErrorMessageDialogConfirm}
          open={saveErrorMessageDialogOpen}
        />
      </form>
    </div>
  );
}
