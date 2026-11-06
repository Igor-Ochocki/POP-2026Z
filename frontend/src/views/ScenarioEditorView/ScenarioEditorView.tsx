import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import Button from '@components/Button/Button';
import Card from '@components/Card/Card';
import PageHeader from '@components/PageHeader/PageHeader';
import TextLabel from '@components/TextLabel/TextLabel';
import TextSubheading from '@components/TextSubheading/TextSubheading';
import { useScenarioEditor } from '@hooks/useScenarioEditor';
import { useParams } from 'react-router';
import './ScenarioEditorView.css';

export function ScenarioEditorView() {
  const { state, actions } = useScenarioEditor();
  const { gameId } = useParams<{ gameId: string }>();
  const scenario = state.scenario;

  return (
    <section className='scenario-editor-view'>
      <Card>
        <PageHeader
          title='Edytor scenariusza'
          subtitle={state.activeGame?.title ?? 'Scenariusz gry'}
          aside={state.activeGame?.status}
        />
        {state.activeGame && (
          <div className='scenario-editor-view__metadata'>
            <TextLabel>{state.activeGame.description}</TextLabel>
          </div>
        )}

        {state.isLoading && (
          <p className='scenario-editor-view__status' role='status'>
            Wczytywanie scenariusza...
          </p>
        )}
        {state.errorMessage && (
          <div className='scenario-editor-view__error' role='alert'>
            <p>{state.errorMessage}</p>
            {state.errorMessage !== 'Nie podano identyfikatora gry.' && (
              <Button
                variant='outline'
                onClick={() => actions.onOpenScenarioEditor(gameId ?? '')}
              >
                Spróbuj ponownie
              </Button>
            )}
          </div>
        )}

        <section className='scenario-editor-view__section'>
          <div className='scenario-editor-view__section-heading'>
            <TextSubheading level={2}>Zadania</TextSubheading>
            <Button disabled onClick={actions.onAddTask}>
              <AddCircleOutlinedIcon fontSize='small' /> Dodaj zadanie
            </Button>
          </div>
          {scenario?.tasks.length ? (
            <ol className='scenario-editor-view__list'>
              {scenario.tasks.map((task) => (
                <li key={task.taskId}>
                  <h3>{task.title}</h3>
                  <p>{task.narrative}</p>
                  <TextLabel>
                    Poziom {task.requiredPlayerLevel} ·{' '}
                    {task.timeLimitMinutes === null
                      ? 'Bez limitu czasu'
                      : `${task.timeLimitMinutes} min`}{' '}
                    · {task.rewardType}: {task.rewardValue}
                  </TextLabel>
                </li>
              ))}
            </ol>
          ) : (
            <p className='scenario-editor-view__empty'>
              {scenario
                ? 'Nie dodano jeszcze żadnych zadań.'
                : 'Brak wczytanych zadań.'}
            </p>
          )}
        </section>

        <section className='scenario-editor-view__section'>
          <div className='scenario-editor-view__section-heading'>
            <TextSubheading level={2}>Warunki zwycięstwa</TextSubheading>
            <Button disabled onClick={actions.onAddVictoryCondition}>
              <AddCircleOutlinedIcon fontSize='small' /> Dodaj warunek
            </Button>
          </div>
          {scenario?.victoryConditions.length ? (
            <ul className='scenario-editor-view__list'>
              {scenario.victoryConditions.map((condition, index) => (
                <li key={`${condition}-${index}`}>{condition}</li>
              ))}
            </ul>
          ) : (
            <p className='scenario-editor-view__empty'>
              {scenario
                ? 'Nie zdefiniowano jeszcze warunków zwycięstwa.'
                : 'Brak wczytanych warunków zwycięstwa.'}
            </p>
          )}
        </section>

        <footer className='scenario-editor-view__footer'>
          <Button variant='secondary' onClick={actions.onCloseScenarioEditor}>
            Anuluj
          </Button>
          <Button onClick={actions.onCloseScenarioEditor}>
            Zapisz i zamknij
          </Button>
        </footer>
      </Card>
    </section>
  );
}
