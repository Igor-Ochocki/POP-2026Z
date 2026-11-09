import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import Button from '@components/Button/Button';
import Card from '@components/Card/Card';
import PageHeader from '@components/PageHeader/PageHeader';
import TextLabel from '@components/TextLabel/TextLabel';
import TextSubheading from '@components/TextSubheading/TextSubheading';
import { useGameList } from '@hooks/useGameList';
import { useNewTask } from '@hooks/useNewTask';
import { useScenarioEditor } from '@hooks/useScenarioEditor';
import type { TaskDTO } from '@app-types/task';
import './ScenarioEditorView.css';

function describeTask(task: TaskDTO): string {
  const timeLimit =
    task.timeLimitMinutes === null
      ? 'Bez limitu czasu'
      : `${task.timeLimitMinutes} min`;
  return `Poziom ${task.requiredPlayerLevel} · ${timeLimit} · ${task.rewardType}: ${task.rewardValue}`;
}

export function ScenarioEditorView() {
  const { state, actions } = useScenarioEditor();
  const newTask = useNewTask();
  const gameList = useGameList();
  const { activeGame, scenario } = state;

  return (
    <section className='scenario-editor-view'>
      <Card>
        <PageHeader
          title='Edytor scenariusza'
          subtitle={activeGame?.title ?? 'Scenariusz gry'}
          aside={activeGame?.status}
        />
        {activeGame && (
          <div className='scenario-editor-view__metadata'>
            <TextLabel>{activeGame.description}</TextLabel>
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
            <Button variant='outline' onClick={actions.onReloadScenario}>
              Spróbuj ponownie
            </Button>
          </div>
        )}

        <section className='scenario-editor-view__section'>
          <div className='scenario-editor-view__section-heading'>
            <TextSubheading level={2}>Zadania</TextSubheading>
            <Button
              disabled={!scenario}
              onClick={newTask.actions.onNewTaskSelect}
            >
              <AddCircleOutlinedIcon fontSize='small' /> Dodaj zadanie
            </Button>
          </div>
          {scenario?.tasks.length ? (
            <ol className='scenario-editor-view__list'>
              {scenario.tasks.map((task) => (
                <li key={task.taskId}>
                  <h3>{task.title}</h3>
                  <p>{task.narrative}</p>
                  <TextLabel>{describeTask(task)}</TextLabel>
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
            {/* TODO: PU58 onAddVictoryCondition */}
            <Button disabled>
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

        {/* TODO: return to this game's definition once PU49 can load a game by id */}
        <footer className='scenario-editor-view__footer'>
          <Button variant='secondary' onClick={gameList.actions.onOpenGameList}>
            Zamknij
          </Button>
        </footer>
      </Card>
    </section>
  );
}
