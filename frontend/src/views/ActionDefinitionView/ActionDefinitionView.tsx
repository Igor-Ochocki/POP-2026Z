import Button from '@components/Button/Button';
import Card from '@components/Card/Card';
import DropdownField from '@components/DropdownField/DropdownField';
import FormSection from '@components/FormSection/FormSection';
import InputField from '@components/InputField/InputField';
import MessageDialog from '@components/MessageDialog/MessageDialog';
import PageHeader from '@components/PageHeader/PageHeader';
import { useActionDefinition } from '@hooks/useActionDefinition';
import type {
  ActionDefinitionDialogTypes,
  ActionType,
  EffectKind,
  IActionDefinitionActions,
} from '@app-types/action';
import './ActionDefinitionView.css';

const actionTypeLabels: Record<ActionType, string> = {
  movement: 'ruch',
  attack: 'atak',
  useItem: 'użycie przedmiotu',
  dialogue: 'dialog',
  custom: 'własna',
  miniGame: 'minigra',
};

const effectKindLabels: Record<EffectKind, string> = {
  changeStat: 'zmiana statystyki',
  addItem: 'dodanie przedmiotu',
  removeItem: 'usunięcie przedmiotu',
  changeLocation: 'zmiana lokacji',
  setFlag: 'ustawienie flagi',
  startMiniGame: 'rozpoczęcie minigry',
  MOVEMENT: 'ruch',
  ATTACK: 'atak',
  USE_ITEM: 'użycie przedmiotu',
  DIALOGUE: 'dialog',
  CUSTOM: 'własna',
  MINI_GAME: 'minigra',
};

const effectKindLabels: Record<EffectKind, string> = {
  CHANGE_STAT: 'zmiana statystyki',
  ADD_ITEM: 'dodanie przedmiotu',
  REMOVE_ITEM: 'usunięcie przedmiotu',
  CHANGE_LOCATION: 'zmiana lokacji',
  SET_FLAG: 'ustawienie flagi',
  START_MINI_GAME: 'rozpoczęcie minigry',
};

function keyByLabel<T extends string>(
  labels: Record<T, string>,
  label: string,
): T | '' {
  return (Object.keys(labels) as T[]).find((k) => labels[k] === label) ?? '';
}

function getDialogs(
  actions: IActionDefinitionActions,
): Record<
  ActionDefinitionDialogTypes,
  { title: string; message: string; onConfirm: () => void }
> {
  return {
    actionSaved: {
      title: 'Sukces',
      message: 'Nowa akcja została dodana',
      onConfirm: actions.onActionSavedMessageDialogConfirm,
    },
    incompleteData: {
      title: 'Błąd',
      message: 'Dane akcji są niekompletne',
      onConfirm: actions.onIncompleteActionDataMessageDialogConfirm,
    },
    saveError: {
      title: 'Błąd',
      message: 'Błąd zapisu danych.',
      onConfirm: actions.onActionSaveErrorMessageDialogConfirm,
    },
  };
}

export function ActionDefinitionView() {
  const { state, actions } = useActionDefinition();
  const { form, isSubmitting } = state;
  const dialog = state.dialogType
    ? getDialogs(actions)[state.dialogType]
    : null;

  return (
    <section className='action-definition-view'>
      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            actions.onSaveAction();
          }}
        >
          <PageHeader
            title='Akcja'
            subtitle='Interakcje dostępne dla graczy'
          />
          <FormSection title='Informacje ogólne'>
            <InputField
              label='Nazwa akcji'
              inputProps={{
                value: form.name,
                placeholder: 'Wprowadź nazwę akcji...',
                onChange: (e) =>
                  actions.onChangeParameter('name', e.target.value),
              }}
            />
            <DropdownField
              label='Rodzaj akcji'
              options={Object.values(actionTypeLabels)}
              value={
                form.actionType === '' ? '' : actionTypeLabels[form.actionType]
              }
              onOptionSelected={(option) =>
                actions.onChangeParameter(
                  'actionType',
                  keyByLabel(actionTypeLabels, option),
                )
              }
            />
          </FormSection>
          <FormSection title='Skutki akcji'>
            <DropdownField
              label='Rodzaj skutków akcji'
              options={Object.values(effectKindLabels)}
              value={
                form.outcomeType === ''
                  ? ''
                  : effectKindLabels[form.outcomeType]
              }
              onOptionSelected={(option) =>
                actions.onChangeParameter(
                  'outcomeType',
                  keyByLabel(effectKindLabels, option),
                )
              }
            />
            <InputField
              label='Wartość skutków akcji'
              inputProps={{
                value: form.outcomeValue,
                placeholder: 'Wprowadź wartość skutków...',

                onChange: (e) =>
                  actions.onChangeParameter('outcomeValue', e.target.value),
              }}
            />
          </FormSection>
          <footer className='action-definition-view__footer'>
            <Button
              variant='secondary'
              disabled={isSubmitting}
              onClick={actions.onCancelActionDefinition}
            >
              Anuluj
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Zapisywanie...' : 'Zapisz i zamknij'}
            </Button>
          </footer>
        </form>
      </Card>
      <MessageDialog
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        open={dialog !== null}
        onClosed={() => dialog?.onConfirm()}
      />
    </section>
  );
}
