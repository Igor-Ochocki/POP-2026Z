import { createBrowserRouter } from 'react-router';
import { Layout } from '@components/Layout/Layout';
import { HomeView } from '@views/HomeView/HomeView';
import MainMenuPage from './features/main-menu/MainMenuPage';
import CalendarPage from './features/calendar/CalendarPage';
import { NotFoundView } from '@views/NotFoundView/NotFoundView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <MainMenuPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'status', element: <HomeView /> },
      { path: '*', element: <NotFoundView /> },
    ],
  },
]);
