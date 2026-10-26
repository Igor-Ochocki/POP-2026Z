import CheckIcon from '@mui/icons-material/Check';
import Button from '@components/Button/Button';
import Card from '@components/Card/Card';
import DropdownField from '@components/DropdownField/DropdownField';
import FormSection from '@components/FormSection/FormSection';
import InputField from '@components/InputField/InputField';
import PageHeader from '@components/PageHeader/PageHeader';
import SegmentedControl from '@components/SegmentedControl/SegmentedControl';
import TextAreaField from '@components/TextAreaField/TextAreaField';
import {
  GAME_CATEGORIES,
  type GameCategory,
  type GameParametersErrors,
  type GameParametersForm,
  type IGameDefinitionActions,
} from '@app-types/game';
import './GameParametersPanel.css';

interface GameParametersPanelProps {
  form: GameParametersForm;
  errors: GameParametersErrors;
  actions: IGameDefinitionActions;
}

export function GameParametersPanel({
  form,
  errors,
  actions,
}: GameParametersPanelProps) {
  return (
    <div className='game-parameters-panel'>
      <Card>
        <PageHeader
          title='Podstawowe parametry gry'
          subtitle='Wszystkie pola są wymagane'
        />
        <FormSection title='Informacje ogólne'>
          <InputField
            label='Nazwa gry'
            errorText={errors.title}
            inputProps={{
              value: form.title,
              placeholder: 'np. Klątwa starego zamku',
              onChange: (e) =>
                actions.onChangeParameter('title', e.target.value),
            }}
          />
          <TextAreaField
            label='Opis gry'
            errorText={errors.description}
            textAreaProps={{
              value: form.description,
              placeholder: 'Krótko opisz fabułę i cel gry',
              onChange: (e) =>
                actions.onChangeParameter('description', e.target.value),
            }}
          />
          <div className='game-parameters-panel__category'>
            <DropdownField
              label='Kategoria'
              options={[...GAME_CATEGORIES]}
              value={form.category}
              errorText={errors.category}
              onOptionSelected={(option) =>
                actions.onChangeParameter('category', option as GameCategory)
              }
            />
          </div>
        </FormSection>
        <FormSection title='Rozgrywka'>
          <div className='game-parameters-panel__grid'>
            <InputField
              label='Minimalna liczba graczy'
              errorText={errors.minPlayers}
              inputProps={{
                type: 'number',
                value: form.minPlayers,
                placeholder: '1',
                onChange: (e) =>
                  actions.onChangeParameter('minPlayers', e.target.value),
              }}
            />
            <InputField
              label='Maksymalna liczba graczy'
              errorText={errors.maxPlayers}
              inputProps={{
                type: 'number',
                value: form.maxPlayers,
                placeholder: '20',
                onChange: (e) =>
                  actions.onChangeParameter('maxPlayers', e.target.value),
              }}
            />
            <InputField
              label='Czas trwania (min)'
              errorText={errors.durationMinutes}
              inputProps={{
                type: 'number',
                value: form.durationMinutes,
                placeholder: '180',
                onChange: (e) =>
                  actions.onChangeParameter('durationMinutes', e.target.value),
              }}
            />
            <SegmentedControl
              label='Czy wymagane zaproszenie?'
              options={[
                { label: 'Nie', value: false },
                { label: 'Tak', value: true },
              ]}
              value={form.requiresInvitation}
              onChange={(value) =>
                actions.onChangeParameter('requiresInvitation', value)
              }
            />
          </div>
        </FormSection>
        <footer className='game-parameters-panel__footer'>
          <Button onClick={actions.onSaveMetadata}>
            <CheckIcon fontSize='small' /> Zapisz
          </Button>
        </footer>
      </Card>
    </div>
  );
}
