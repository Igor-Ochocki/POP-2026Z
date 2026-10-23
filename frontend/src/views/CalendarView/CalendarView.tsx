import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Button from '@components/Button/Button';
import Calendar from '@components/Calendar/Calendar';
import { useCalendar } from '@hooks/useCalendar';
import './CalendarView.css';

export function CalendarView() {
  const { state, actions } = useCalendar();

  return (
    <main className='calendar-page'>
      <header className='calendar-page__header'>
        <h1>Kalendarz wydarzeń</h1>
        <Button
          className='calendar-page__back'
          aria-label='Powrót'
          onClick={actions.onBack}
        >
          <ChevronLeftIcon fontSize='large' />
        </Button>
      </header>

      <Calendar
        events={state.events}
        onEventDetails={actions.onEventDetails}
        onDateClick={actions.onDateClick}
      />

      <div className='calendar-page__actions'>
        <Button variant='primary' onClick={actions.onAddEvent}>
          Dodaj wydarzenie
        </Button>
      </div>
    </main>
  );
}
