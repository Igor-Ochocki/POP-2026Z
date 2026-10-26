import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import ActionTile from '@components/ActionTile/ActionTile';
import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import Card from '@components/Card/Card';
import MessageDialog from '@components/MessageDialog/MessageDialog';
import PageHeader from '@components/PageHeader/PageHeader';
import { useGameDefinition } from '@hooks/useGameDefinition';
import type { GameMetadataDTO } from '@app-types/game';
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

export function GameDefinitionView() {
  const { state, actions } = useGameDefinition();
  const game = state.activeGame;
  const canSave = game !== null && !state.isSubmitting;
  const soonBadge = <Badge>Wkrótce</Badge>;

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
            <ActionTile
              icon={<AutoStoriesOutlinedIcon />}
              title='Edytuj scenariusz gry'
              description='Zadania i warunki zwycięstwa'
              badge={soonBadge}
              onClick={actions.onOpenScenarioEditor}
            />
            <ActionTile
              icon={<MapOutlinedIcon />}
              title='Edytuj mapę gry'
              description='Komnaty i rozmieszczenie elementów'
              badge={soonBadge}
              onClick={actions.onOpenMapEditor}
            />
            <ActionTile
              icon={<BoltOutlinedIcon />}
              title='Zdefiniuj akcję'
              description='Interakcje dostępne dla graczy'
              badge={soonBadge}
              onClick={actions.onOpenActionDefinition}
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
            <span className='game-definition-view__hint'>
              Uzupełnij podstawowe parametry, aby zapisać grę.
            </span>
          )}
        </Card>
      )}
      <MessageDialog
        title={state.dialog?.title ?? ''}
        message={state.dialog?.message ?? ''}
        open={state.dialog !== null}
        onClosed={actions.onCloseDialog}
      />
    </section>
  );
}
