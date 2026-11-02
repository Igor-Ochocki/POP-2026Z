import EditNoteIcon from '@mui/icons-material/EditNote';
import HomeIcon from '@mui/icons-material/Home';
import { NavLink, Outlet } from 'react-router';
import './Layout.css';

export function Layout() {
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
        </nav>
      </header>
      <main className='layout__content'>
        <Outlet />
      </main>
    </div>
  );
}
