import { useNavigate } from 'react-router';
import Button from '../../shared/components/button/Button';
import Calendar from './components/Calendar';
import { mockEvents } from './mocks';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import './CalendarPage.css';

export default function CalendarPage() {
  const navigate = useNavigate();

  return (
    <main className='calendar-page'>
      <header className='calendar-page__header'>
        <h1>Kalendarz wydarzeń</h1>
        <Button
          className='calendar-page__back'
          aria-label='Powrót'
          onClick={() => navigate('/')}
        >
          <ChevronLeftIcon fontSize='large' />
        </Button>
      </header>

      <Calendar
        events={mockEvents}
        onEventDetails={(id) => console.log('Szczegóły wydarzenia', id)}
        onDateClick={(date) => console.log('Kliknięto dzień', date)} // nie wiem czy to będzie potrzebne
      />

      <div className='calendar-page__actions'>
        <Button
          variant='primary'
          onClick={() => console.log('Dodaj wydarzenie')}
        >
          Dodaj wydarzenie
        </Button>
      </div>
    </main>
  );
}
