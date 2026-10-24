import { createBrowserRouter } from 'react-router';
import { Layout } from '@components/Layout/Layout';
import { HomeView } from '@views/HomeView/HomeView';
import { NotFoundView } from '@views/NotFoundView/NotFoundView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomeView /> },
      { path: '*', element: <NotFoundView /> },
    ],
  },
]);
