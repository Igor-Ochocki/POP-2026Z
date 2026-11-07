import Button from '@components/Button/Button';
import { useCalendar } from '@hooks/useCalendar';
import './MainMenuView.css';

export function MainMenuView() {
  const { actions } = useCalendar();

  return (
    <main className='main-menu'>
      <h1>Menu główne</h1>
      <Button onClick={actions.onShowCalendar}>Kalendarz ›</Button>
    </main>
  );
}
