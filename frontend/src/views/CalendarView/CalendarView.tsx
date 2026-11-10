import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Button from '@components/Button/Button';
import Calendar from '@components/Calendar/Calendar';
import { useCalendar } from '@hooks/useCalendar';
import { useReservation } from '@hooks/useReservation';
import './CalendarView.css';

export function CalendarView() {
  const { state, actions } = useCalendar();
  const reservation = useReservation();

  return (
    <main className='calendar-page'>
      <header className='calendar-page__header'>
        <h1>Kalendarz wydarzeń</h1>
        <div className='calendar-page__back'>
          <Button
            variant='secondary'
            aria-label='Powrót'
            onClick={actions.onBack}
          >
            <ChevronLeftIcon fontSize='large' />
          </Button>
        </div>
      </header>

      {state.errorMessage && state.month && (
        <div className='calendar-page__error' role='alert'>
          <p>{state.errorMessage}</p>
          <Button
            variant='outline'
            onClick={() => state.month && actions.onChangeMonth(state.month)}
          >
            Spróbuj ponownie
          </Button>
        </div>
      )}

      <Calendar
        events={state.events}
        onMonthChange={actions.onChangeMonth}
        onEventClick={(eventId) => {
          const slot = state.events.find((event) => event.id === eventId);
          if (slot) reservation.actions.onOpenReservation(slot);
        }}
      />

      <div className='calendar-page__actions'>
        {/* TODO: PU39 onAddEvent */}
        <Button variant='primary' disabled>
          Dodaj wydarzenie
        </Button>
      </div>
    </main>
  );
}
