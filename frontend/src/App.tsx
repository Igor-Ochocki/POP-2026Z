import { Routes, Route } from 'react-router';
import MainMenuPage from './features/main-menu/MainMenuPage';
import CalendarPage from './features/calendar/CalendarPage';

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<MainMenuPage />} />
      <Route path='/kalendarz' element={<CalendarPage />} />
    </Routes>
  );
}
