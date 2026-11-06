import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ActionTile from '@components/ActionTile/ActionTile';
import PageHeader from '@components/PageHeader/PageHeader';
import './CreatorPanelView.css';

export function CreatorPanelView() {
  return (
    <section className='creator-panel-view'>
      <PageHeader
        title='Panel Twórcy'
        subtitle='Twórz nowe gry i zarządzaj istniejącymi'
      />
      <div className='creator-panel-view__tiles'>
        <ActionTile
          icon={<AddCircleOutlinedIcon />}
          title='Utwórz nową grę'
          description='Zdefiniuj parametry, scenariusz i mapę gry'
          to='/creator/games/new'
        />
        <ActionTile
          icon={<ListAltIcon />}
          title='Lista gier'
          description='Przeglądaj swoje gry i ich statusy'
          to='/creator/games'
        />
      </div>
    </section>
  );
}
