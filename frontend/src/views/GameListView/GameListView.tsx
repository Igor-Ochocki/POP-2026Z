import './GameListView.css';
import Input from '@components/Input/Input.tsx';
import Button from '@components/Button/Button.tsx';
import { useGameList } from '@hooks/useGameList.ts';
import TextHeading from '@components/TextHeading/TextHeading.tsx';
import PageHeader from '@components/PageHeader/PageHeader.tsx';
import TextSubtitle from '@components/TextSubtitle/TextSubtitle.tsx';
import { type JSX, useState } from 'react';

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
  return (
    <div className='game-list-filter-dialog'>
      <PageHeader title='Filtry' />
      {filterTags.map((tag) => (
        <Button
          key={tag}
          onClick={() => {
            tags.includes(tag)
              ? setTags(tags.filter((v) => v !== tag))
              : setTags([...tags, tag]);
          }}
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
  const {
    state: {
      games,
      searchString,
      filterTags,
      appliedTags,
      downloadErrored,
      filterDialogOpen,
    },
    actions: {
      onChangeParameter,
      onListReload,
      onShowMore,
      onOpenFilterDialog,
      onFilterSubmit,
    },
  } = useGameList();

  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(searchString.toLocaleLowerCase()),
  );

  return (
    <div className='game-list-view'>
      <PageHeader title='Lista gier' />
      <div className='game-list-filter-row'>
        <Input
          onChange={(e) => onChangeParameter('searchString', e.target.value)}
          placeholder='Szukaj gry...'
        ></Input>
        <Button onClick={onOpenFilterDialog} disabled={filterTags.length === 0}>
          Filtruj
        </Button>
      </div>

      {downloadErrored ? (
        <>
          <TextHeading level={5}>
            Ups! Mamy problemy z pobraniem danych
          </TextHeading>
          <Button onClick={onListReload}>Spróbuj ponownie</Button>
        </>
      ) : (
        <div className='game-list-list'>
          {filteredGames.map((game) => (
            <div className='game-list-item' key={game.gameId}>
              <TextHeading level={5}>{game.title}</TextHeading>
              <TextSubtitle>Maximum graczy: {game.maxPlayers}</TextSubtitle>
            </div>
          ))}
          {filteredGames.length === 0 && (
            <TextHeading level={6}>
              Nie znaleźliśmy gier spełniających twoje kryteria
            </TextHeading>
          )}
        </div>
      )}

      {filteredGames.length > 0 && !downloadErrored && (
        <Button onClick={onShowMore}>Pokaż wiecej</Button>
      )}
      {filterDialogOpen && (
        <FilterDialog
          filterTags={filterTags}
          appliedTags={appliedTags}
          applyFilter={(tags) => onFilterSubmit(tags)}
        />
      )}
    </div>
  );
}
