import HomeIcon from '@mui/icons-material/Home'
import { NavLink, Outlet } from 'react-router'
import './Layout.css'

export function Layout() {
  return (
    <div className="layout">
      <header className="layout__header">
        <nav className="layout__nav">
          <NavLink to="/" end className="layout__link">
            <HomeIcon fontSize="small" /> Start
          </NavLink>
        </nav>
      </header>
      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  )
}
