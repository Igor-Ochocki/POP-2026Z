import { createBrowserRouter } from 'react-router';
import { Layout } from '@components/Layout/Layout';
import { HomeView } from '@views/HomeView/HomeView';
import { CreatorPanelView } from '@views/CreatorPanelView/CreatorPanelView';
import { GameDefinitionView } from '@views/GameDefinitionView/GameDefinitionView';
import { ScenarioEditorView } from '@views/ScenarioEditorView/ScenarioEditorView';
import { NotFoundView } from '@views/NotFoundView/NotFoundView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomeView /> },
      { path: 'creator', element: <CreatorPanelView /> },
      { path: 'creator/games/new', element: <GameDefinitionView /> },
      {
        path: 'creator/games/:gameId/scenario',
        element: <ScenarioEditorView />,
      },
      { path: '*', element: <NotFoundView /> },
    ],
  },
]);
