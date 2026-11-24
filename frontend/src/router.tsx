import { createBrowserRouter } from 'react-router';
import { Layout } from '@components/Layout/Layout';
import { HomeView } from '@views/HomeView/HomeView';
import { CreatorPanelView } from '@views/CreatorPanelView/CreatorPanelView';
import { GameDefinitionView } from '@views/GameDefinitionView/GameDefinitionView';
import { CalendarView } from '@views/CalendarView/CalendarView';
import { ActionDefinitionView } from '@views/ActionDefinitionView/ActionDefinitionView';
import { NotFoundView } from '@views/NotFoundView/NotFoundView';
import { GameListView } from '@views/GameListView/GameListView';
import { NewTaskView } from '@views/NewTaskView/NewTaskView';
import { ScenarioEditorView } from '@views/ScenarioEditorView/ScenarioEditorView';
import { ReservationView } from '@views/ReservationView/ReservationView';
import { SensorDefinitionView } from '@views/SensorDefinition/SensorDefinitionView.tsx';
import { MapEditorView } from '@views/MapEditorView/MapEditorView';
import { VictoryConditionView } from '@views/VictoryConditionView/VictoryConditionView';
import { DisplayActionsView } from '@views/DisplayActionsView/DisplayActionsView';
import { RoomEditView } from '@views/RoomEditView/RoomEditView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomeView /> },
      { path: 'calendar', element: <CalendarView /> },
      { path: 'reservations', element: <ReservationView /> },
      { path: 'creator', element: <CreatorPanelView /> },
      { path: 'creator/games', element: <GameListView /> },
      // :gameId is 'new' for a game that has not been saved yet.
      { path: 'creator/games/:gameId', element: <GameDefinitionView /> },
      {
        path: 'creator/games/:gameId/actions',
        element: <DisplayActionsView />,
      },
      {
        path: 'creator/games/:gameId/actions/new',
        element: <ActionDefinitionView />,
      },
      {
        path: 'creator/games/:gameId/scenario',
        element: <ScenarioEditorView />,
      },
      {
        path: 'creator/games/:gameId/scenario/new-task',
        element: <NewTaskView />,
      },
      { path: 'creator/games/:gameId/map', element: <MapEditorView /> },
      {
        path: 'creator/games/:gameId/scenario/victory-condition',
        element: <VictoryConditionView />,
      },
      {
        path: 'creator/games/:gameId/scenario/victory-condition/:victoryConditionId',
        element: <VictoryConditionView />,
      },
      {
        path: 'creator/games/:gameId/map/rooms/:roomId',
        element: <RoomEditView />,
      },
      {
        path: 'creator/games/:gameId/map/rooms/:roomId/add-sensor',
        element: <SensorDefinitionView />,
      },
      { path: '*', element: <NotFoundView /> },
    ],
  },
]);
