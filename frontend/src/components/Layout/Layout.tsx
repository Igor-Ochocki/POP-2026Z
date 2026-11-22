import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditNoteIcon from '@mui/icons-material/EditNote';
import HomeIcon from '@mui/icons-material/Home';
import { NavLink, Outlet } from 'react-router';
import { useCalendar } from '@hooks/useCalendar';
import './Layout.css';

export function Layout() {
  const calendar = useCalendar();

  return (
    <div className='layout'>
      <header className='layout__header'>
        <nav className='layout__nav'>
          <NavLink to='/' end className='layout__link'>
            <HomeIcon fontSize='small' /> Start
          </NavLink>
          <NavLink to='/creator' className='layout__link'>
            <EditNoteIcon fontSize='small' /> Panel Twórcy
          </NavLink>
          {/* PU1 step 1 - the menu option goes through the calendar presenter */}
          <NavLink
            to='/calendar'
            className='layout__link'
            onClick={(e) => {
              e.preventDefault();
              calendar.actions.onShowCalendar();
            }}
          >
            <CalendarMonthIcon fontSize='small' /> Kalendarz
          </NavLink>
        </nav>
      </header>
      <main className='layout__content'>
        <Outlet />
      </main>
    </div>
  );
}
