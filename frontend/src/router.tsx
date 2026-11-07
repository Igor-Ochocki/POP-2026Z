import { createBrowserRouter } from 'react-router';
import { Layout } from '@components/Layout/Layout';
import { HomeView } from '@views/HomeView/HomeView';
import { CreatorPanelView } from '@views/CreatorPanelView/CreatorPanelView';
import { GameDefinitionView } from '@views/GameDefinitionView/GameDefinitionView';
import { NotFoundView } from '@views/NotFoundView/NotFoundView';
import { NewTaskView } from '@views/NewTaskView/NewTaskView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomeView /> },
      { path: 'creator', element: <CreatorPanelView /> },
      { path: 'creator/games/new', element: <GameDefinitionView /> },
      { path: 'creator/games/:gameId/scenario/new-task', element: <NewTaskView /> },
      { path: '*', element: <NotFoundView /> },
    ],
  },
]);
