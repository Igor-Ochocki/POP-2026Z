import FullCalendar from '@fullcalendar/react';
import themePlugin from '@fullcalendar/react/themes/classic';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import interactionPlugin from '@fullcalendar/react/interaction';
import plLocale from '@fullcalendar/react/locales/pl';
import type { CalendarEvent } from '../types';

import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/classic/theme.css';
import '@fullcalendar/react/themes/classic/palette.css';
import './Calendar.css';

interface CalendarProps {
  events: CalendarEvent[];
  onEventDetails?: (eventId: string) => void;
  onDateClick?: (dateStr: string) => void; // nie wiem czy dni miesiąca będą klikalne ale może się przyda kiedyś
}

export default function Calendar({
  events,
  onEventDetails,
  onDateClick, // to samo tu
}: CalendarProps) {
  return (
    <div className='calendar'>
      <FullCalendar
        plugins={[themePlugin, dayGridPlugin, interactionPlugin]}
        initialView='dayGridMonth'
        initialDate={new Date().toISOString().split('T')[0]}
        locale={plLocale}
        firstDay={1}
        dayCellTopInnerClass='calendar-day-number'
        dayCellTopClass='calendar-day-top'
        fixedWeekCount={false}
        headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
        events={events}
        toolbarClass='calendar-toolbar'
        toolbarTitleClass='calendar-title'
        buttonClass='calendar-button'
        dayHeaderClass='calendar-day-header'
        dayCellClass={(info) =>
          [
            'calendar-cell',
            info.isOther && 'calendar-cell--other',
            info.isToday && 'calendar-cell--today',
          ]
            .filter(Boolean)
            .join(' ')
        }
        rowEventClass='calendar-event'
        eventClick={(info) => onEventDetails?.(info.event.id)}
        dateClick={(info) => onDateClick?.(info.dateStr)} // i tu, i jeszcze w calendarpage.tsx jest
      />
    </div>
  );
}
