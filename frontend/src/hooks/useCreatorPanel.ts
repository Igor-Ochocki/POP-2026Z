import { useNavigate } from 'react-router';
import type { ICreatorPanelActions } from '@app-types/creatorPanel';

const CREATOR_PANEL_PATH = '/creator';

export function useCreatorPanel(): { actions: ICreatorPanelActions } {
  const navigate = useNavigate();

  return {
    actions: {
      onOpenCreatorPanel: () => void navigate(CREATOR_PANEL_PATH),
    },
  };
}
