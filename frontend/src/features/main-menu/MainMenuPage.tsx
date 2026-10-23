import { useNavigate } from 'react-router';
import Button from '../../shared/components/button/Button';
import './MainMenuPage.css';

export default function MainMenuPage() {
  const navigate = useNavigate();

  return (
    <main className='main-menu'>
      <h1>Menu główne</h1>
      <Button onClick={() => navigate('/calendar')}>Kalendarz ›</Button>
    </main>
  );
}
