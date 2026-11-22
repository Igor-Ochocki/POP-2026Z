import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Button from '@components/Button/Button';
import Calendar from '@components/Calendar/Calendar';
import SegmentedControl from '@components/SegmentedControl/SegmentedControl';
import { useCalendar } from '@hooks/useCalendar';
import { useEventJoin } from '@hooks/useEventJoin';
import { useReservation } from '@hooks/useReservation';
import { EventJoinDialogs } from './EventJoinDialogs';
import './CalendarView.css';

export function CalendarView() {
  const { state, actions } = useCalendar();
  const reservation = useReservation();
  const eventJoin = useEventJoin();

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

      <SegmentedControl
        label='Widok'
        options={[
          { label: 'Terminy', value: 'slots' },
          { label: 'Wydarzenia', value: 'events' },
        ]}
        value={state.mode}
        onChange={actions.onChangeMode}
      />

      <Calendar
        events={state.events}
        onMonthChange={actions.onChangeMonth}
        onEventClick={(eventId) => {
          const event = state.events.find((item) => item.id === eventId);
          if (!event) return;
          if (state.mode === 'events') eventJoin.actions.onOpenEventJoin(event);
          else reservation.actions.onOpenReservation(event);
        }}
      />

      {state.mode === 'slots' && (
        <div className='calendar-page__actions'>
          <Button
            variant='primary'
            onClick={() => reservation.actions.onOpenReservation()}
          >
            Dodaj wydarzenie
          </Button>
        </div>
      )}

      <EventJoinDialogs
        state={eventJoin.state}
        actions={eventJoin.actions}
        onMessageClosed={() =>
          state.month && actions.onChangeMonth(state.month)
        }
      />
    </main>
  );
}
