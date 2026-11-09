import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import ActionTile from '@components/ActionTile/ActionTile';
import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import Card from '@components/Card/Card';
import MessageDialog from '@components/MessageDialog/MessageDialog';
import PageHeader from '@components/PageHeader/PageHeader';
import TextLabel from '@components/TextLabel/TextLabel';
import { useActionDefinition } from '@hooks/useActionDefinition';
import { useCreatorPanel } from '@hooks/useCreatorPanel';
import { useGameDefinition } from '@hooks/useGameDefinition';
import { useGameList } from '@hooks/useGameList';
import { useScenarioEditor } from '@hooks/useScenarioEditor';
import type { ICreatorPanelActions } from '@app-types/creatorPanel';
import type {
  GameDefinitionDialogTypes,
  GameMetadataDTO,
  IGameDefinitionActions,
} from '@app-types/game';
import type { IGameListActions } from '@app-types/gameList';
import { GameParametersPanel } from './GameParametersPanel';
import './GameDefinitionView.css';

function describeGame(game: GameMetadataDTO): string {
  return [
    game.tags[0],
    `${game.minPlayers}–${game.maxPlayers} graczy`,
    `${game.durationMinutes} min`,
    game.requiresInvitation ? 'na zaproszenie' : 'otwarta',
  ].join(' · ');
}

function getDialogs(
  actions: IGameDefinitionActions,
  creatorPanelActions: ICreatorPanelActions,
  gameListActions: IGameListActions,
): Record<
  GameDefinitionDialogTypes,
  { title: string; message: string; onConfirm: () => void }
> {
  return {
    parametersSaved: {
      title: 'Sukces',
      message: 'Poprawnie zapisano parametry',
      onConfirm: actions.onParametersSavedMessageDialogConfirm,
    },
    incorrectData: {
      title: 'Błąd',
      message: 'Podane dane są błędne',
      onConfirm: actions.onIncorrectDataMessageDialogConfirm,
    },
    gameSaved: {
      title: 'Sukces',
      message: 'Poprawnie zapisano grę',
      onConfirm: gameListActions.onOpenGameList,
    },
    gameSubmitted: {
      title: 'Sukces',
      message: 'Poprawnie zapisano grę i wysłano do recenzenta',
      onConfirm: creatorPanelActions.onOpenCreatorPanel,
    },
    saveError: {
      title: 'Błąd',
      message: 'Nie udało się zapisać gry. Spróbuj ponownie.',
      onConfirm: actions.onSaveErrorMessageDialogConfirm,
    },
  };
}

export function GameDefinitionView() {
  const { state, actions } = useGameDefinition();
  const { actions: actionDefinitionActions } = useActionDefinition();
  const creatorPanel = useCreatorPanel();
  const gameList = useGameList();
  const scenarioEditor = useScenarioEditor();
  const game = state.activeGame;
  const canSave = game !== null && !state.isSubmitting;
  const dialog = state.dialogType
    ? getDialogs(actions, creatorPanel.actions, gameList.actions)[
        state.dialogType
      ]
    : null;

  return (
    <section className='game-definition-view'>
      {state.activePanelType === 'parameters' ? (
        <GameParametersPanel
          form={state.parametersForm}
          errors={state.validationErrors}
          actions={actions}
        />
      ) : (
        <Card>
          <PageHeader
            title='Definicja gry'
            subtitle={game?.title ?? 'Nowa gra'}
            aside={
              <Badge variant='primary'>{game?.status ?? 'W edycji'}</Badge>
            }
          />
          <div className='game-definition-view__tiles'>
            <ActionTile
              icon={<TuneIcon />}
              title='Edytuj podstawowe parametry'
              description={
                game ? describeGame(game) : 'Nazwa, opis, kategoria i gracze'
              }
              badge={
                game ? (
                  <Badge variant='success'>Uzupełnione</Badge>
                ) : (
                  <Badge variant='primary'>Wymagane</Badge>
                )
              }
              onClick={actions.onEditParameters}
            />
            <ActionTile
              icon={<AutoStoriesOutlinedIcon />}
              title='Edytuj scenariusz gry'
              description={
                game?.gameId
                  ? 'Zadania i warunki zwycięstwa'
                  : 'Zapisz grę, aby otworzyć jej scenariusz'
              }
              onClick={
                game?.gameId
                  ? () =>
                      scenarioEditor.actions.onOpenScenarioEditor(game.gameId)
                  : undefined
              }
            />
            {/* TODO: enable once PU60 is implemented */}
            <ActionTile
              icon={<MapOutlinedIcon />}
              title='Edytuj mapę gry'
              description='Komnaty i rozmieszczenie elementów'
            />
            <ActionTile
              icon={<BoltOutlinedIcon />}
              title='Zdefiniuj akcję'
              description={
                game?.gameId
                  ? 'Interakcje dostępne dla graczy'
                  : 'Zapisz grę, aby zdefiniować akcję'
              }
              onClick={
                game?.gameId
                  ? () => actionDefinitionActions.onAddAction(game.gameId)
                  : undefined
              }
            />
            {/* TODO: PU50 onOpenSensorDefinition(gameId) */}
            <ActionTile
              icon={<SensorsOutlinedIcon />}
              title='Dodaj nowy czujnik'
              description='Czujniki wyzwalające akcje w grze'
            />
          </div>
          <footer className='game-definition-view__footer'>
            <Button
              variant='secondary'
              onClick={creatorPanel.actions.onOpenCreatorPanel}
            >
              Anuluj
            </Button>
            <div className='game-definition-view__save'>
              <Button
                variant='outline'
                disabled={!canSave}
                onClick={actions.onSaveDraft}
              >
                <SaveOutlinedIcon fontSize='small' /> Zapisz
              </Button>
              <Button disabled={!canSave} onClick={actions.onSubmitForReview}>
                <SendOutlinedIcon fontSize='small' />
                {state.isSubmitting ? 'Zapisywanie...' : 'Zapisz i wyślij'}
              </Button>
            </div>
          </footer>
          {!game && (
            <div className='game-definition-view__hint'>
              <TextLabel>
                Uzupełnij podstawowe parametry, aby zapisać grę.
              </TextLabel>
            </div>
          )}
        </Card>
      )}
      <MessageDialog
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        open={dialog !== null}
        onClosed={() => dialog?.onConfirm()}
      />
    </section>
  );
}
