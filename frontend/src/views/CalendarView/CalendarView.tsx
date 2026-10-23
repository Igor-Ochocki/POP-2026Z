import { useNavigate } from 'react-router';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Button from '@components/Button/Button';
import Calendar from '@components/Calendar/Calendar';
import { mockEvents } from './mocks';
import './CalendarView.css';

export function CalendarView() {
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
        onDateClick={(date) => console.log('Kliknięto dzień', date)}
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
