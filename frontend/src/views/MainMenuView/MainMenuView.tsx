import { useNavigate } from 'react-router';
import Button from '@components/Button/Button';
import './MainMenuView.css';

export function MainMenuView() {
  const navigate = useNavigate();

  return (
    <main className='main-menu'>
      <h1>Menu główne</h1>
      <Button onClick={() => navigate('/calendar')}>Kalendarz ›</Button>
    </main>
  );
}
