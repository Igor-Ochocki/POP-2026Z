import { createBrowserRouter } from 'react-router';
import { Layout } from '@components/Layout/Layout';
import { HomeView } from '@views/HomeView/HomeView';
import { CalendarView } from '@views/CalendarView/CalendarView';
import { MainMenuView } from '@views/MainMenuView/MainMenuView';
import { NotFoundView } from '@views/NotFoundView/NotFoundView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <MainMenuView /> },
      { path: 'calendar', element: <CalendarView /> },
      { path: 'status', element: <HomeView /> },
      { path: '*', element: <NotFoundView /> },
    ],
  },
]);
