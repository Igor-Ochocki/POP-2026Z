import FullCalendar from '@fullcalendar/react';
import type { DayCellInfo } from '@fullcalendar/react';
import themePlugin from '@fullcalendar/react/themes/classic';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import interactionPlugin from '@fullcalendar/react/interaction';
import plLocale from '@fullcalendar/react/locales/pl';
import type { CalendarEvent } from '@app-types/calendar';

import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/classic/theme.css';
import '@fullcalendar/react/themes/classic/palette.css';
import './Calendar.css';

interface CalendarProps {
  events: CalendarEvent[];
  onEventDetails?: (eventId: string) => void;
  onDateClick?: (dateStr: string) => void;
}

function getDayCellClass({ isOther, isToday }: DayCellInfo): string {
  const classes = ['calendar-cell'];
  if (isOther) classes.push('calendar-cell--other');
  if (isToday) classes.push('calendar-cell--today');
  return classes.join(' ');
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
        dayCellClass={getDayCellClass}
        rowEventClass='calendar-event'
        eventClick={(info) => onEventDetails?.(info.event.id)}
        dateClick={(info) => onDateClick?.(info.dateStr)}
      />
    </div>
  );
}
