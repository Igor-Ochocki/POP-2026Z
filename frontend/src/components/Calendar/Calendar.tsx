import FullCalendar from '@fullcalendar/react';
import type { DatesSetInfo, DayCellInfo } from '@fullcalendar/react';
import themePlugin from '@fullcalendar/react/themes/classic';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import plLocale from '@fullcalendar/react/locales/pl';
import type { CalendarEventDTO } from '@app-types/calendar';

import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/classic/theme.css';
import '@fullcalendar/react/themes/classic/palette.css';
import './Calendar.css';

interface CalendarProps {
  events: CalendarEventDTO[];
  // First day of the month currently shown - also fired on the first render.
  onMonthChange: (month: Date) => void;
}

function getDayCellClass({ isOther, isToday }: DayCellInfo): string {
  const classes = ['calendar-cell'];
  if (isOther) classes.push('calendar-cell--other');
  if (isToday) classes.push('calendar-cell--today');
  return classes.join(' ');
}

export default function Calendar({ events, onMonthChange }: CalendarProps) {
  return (
    <div className='calendar'>
      <FullCalendar
        plugins={[themePlugin, dayGridPlugin]}
        initialView='dayGridMonth'
        locale={plLocale}
        firstDay={1}
        dayCellTopInnerClass='calendar-day-number'
        dayCellTopClass='calendar-day-top'
        fixedWeekCount={false}
        headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
        events={events.map(({ id, title, datetime }) => ({
          id,
          title,
          start: datetime,
        }))}
        datesSet={(info: DatesSetInfo) => onMonthChange(info.view.currentStart)}
        toolbarClass='calendar-toolbar'
        toolbarTitleClass='calendar-title'
        buttonClass='calendar-button'
        dayHeaderClass='calendar-day-header'
        dayCellClass={getDayCellClass}
        rowEventClass='calendar-event'
      />
    </div>
  );
}
