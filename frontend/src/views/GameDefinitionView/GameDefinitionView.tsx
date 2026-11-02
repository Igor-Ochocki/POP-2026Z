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
import { useGameDefinition } from '@hooks/useGameDefinition';
import type {
  GameDefinitionDialog,
  GameMetadataDTO,
  IGameDefinitionActions,
} from '@app-types/game';
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
): Record<
  GameDefinitionDialog,
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
      onConfirm: actions.onGameSavedMessageDialogConfirm,
    },
    gameSubmitted: {
      title: 'Sukces',
      message: 'Poprawnie zapisano grę i wysłano do recenzenta',
      onConfirm: actions.onGameSubmittedMessageDialogConfirm,
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
  const game = state.activeGame;
  const canSave = game !== null && !state.isSubmitting;
  const dialog = state.dialog ? getDialogs(actions)[state.dialog] : null;

  return (
    <section className='game-definition-view'>
      {state.activePanel === 'parameters' ? (
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
            {/* TODO: enable once PU56, PU60, PU51 and PU50 are implemented */}
            <ActionTile
              icon={<AutoStoriesOutlinedIcon />}
              title='Edytuj scenariusz gry'
              description='Zadania i warunki zwycięstwa'
            />
            <ActionTile
              icon={<MapOutlinedIcon />}
              title='Edytuj mapę gry'
              description='Komnaty i rozmieszczenie elementów'
            />
            <ActionTile
              icon={<BoltOutlinedIcon />}
              title='Zdefiniuj akcję'
              description='Interakcje dostępne dla graczy'
            />
            <ActionTile
              icon={<SensorsOutlinedIcon />}
              title='Dodaj nowy czujnik'
              description='Czujniki wyzwalające akcje w grze'
            />
          </div>
          <footer className='game-definition-view__footer'>
            <Button variant='secondary' onClick={actions.onCancelGameCreation}>
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
