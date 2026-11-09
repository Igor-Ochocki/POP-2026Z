import { useState, type JSX } from 'react';
import Button from '@components/Button/Button';
import Input from '@components/Input/Input';
import PageHeader from '@components/PageHeader/PageHeader';
import TextHeading from '@components/TextHeading/TextHeading';
import TextSubtitle from '@components/TextSubtitle/TextSubtitle';
import { useGameDefinition } from '@hooks/useGameDefinition';
import { useGameList } from '@hooks/useGameList';
import './GameListView.css';

interface FilterDialogProps {
  filterTags: string[];
  appliedTags: string[];
  applyFilter: (tags: string[]) => void;
}

function FilterDialog({
  filterTags,
  appliedTags,
  applyFilter,
}: FilterDialogProps): JSX.Element {
  const [tags, setTags] = useState(appliedTags);

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) setTags(tags.filter((t) => t !== tag));
    else setTags([...tags, tag]);
  };

  return (
    <div className='game-list-filter-dialog'>
      <PageHeader title='Filtry' />
      {filterTags.map((tag) => (
        <Button
          key={tag}
          onClick={() => toggleTag(tag)}
          variant={tags.includes(tag) ? 'primary' : 'secondary'}
        >
          {tag}
        </Button>
      ))}
      <Button onClick={() => applyFilter(tags)}>Zastosuj</Button>
    </div>
  );
}

export function GameListView() {
  const { state, actions } = useGameList();
  const gameDefinition = useGameDefinition();

  const filteredGames = state.games.filter((game) =>
    game.title.toLowerCase().includes(state.searchString.toLowerCase()),
  );

  return (
    <div className='game-list-view'>
      <PageHeader title='Lista gier' />
      <div className='game-list-filter-row'>
        <Input
          value={state.searchString}
          onChange={(e) =>
            actions.onChangeParameter('searchString', e.target.value)
          }
          placeholder='Szukaj gry...'
        />
        <Button
          onClick={actions.onOpenFilterDialog}
          disabled={state.filterTags.length === 0}
        >
          Filtruj
        </Button>
      </div>

      {state.downloadErrored ? (
        <>
          <TextHeading level={5}>
            Ups! Mamy problemy z pobraniem danych
          </TextHeading>
          <Button onClick={actions.onListReload}>Spróbuj ponownie</Button>
        </>
      ) : (
        <div className='game-list-list'>
          {filteredGames.map((game) => (
            <button
              type='button'
              className='game-list-item'
              key={game.gameId}
              onClick={() => gameDefinition.actions.onOpenGame(game.gameId)}
            >
              <TextHeading level={5}>{game.title}</TextHeading>
              <TextSubtitle>Maximum graczy: {game.maxPlayers}</TextSubtitle>
            </button>
          ))}
          {filteredGames.length === 0 && (
            <TextHeading level={6}>
              Nie znaleźliśmy gier spełniających twoje kryteria
            </TextHeading>
          )}
        </div>
      )}

      {state.hasMoreGames && !state.downloadErrored && (
        <Button onClick={actions.onShowMore}>Pokaż więcej</Button>
      )}
      {state.filterDialogOpen && (
        <FilterDialog
          filterTags={state.filterTags}
          appliedTags={state.appliedTags}
          applyFilter={actions.onFilterSubmit}
        />
      )}
    </div>
  );
}
