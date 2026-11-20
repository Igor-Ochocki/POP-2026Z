
import { useNavigate, useParams } from 'react-router';
import type { IRoomEditActions } from '@app-types/map';
 
// THIS EXISTS ONLY AS A  SUBSTITUTE FOR THE REAL HOOK (PU59), WHICH IS NOT IMPLEMENTED BY ME (PU60)
export function useRoomEdit(): { actions: IRoomEditActions } {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
 
  return {
    actions: {
      onOpenRoomEditor: (room) =>
        void navigate(`/creator/games/${gameId}/map/rooms/${room.id}`, {
          state: { room },
        }),
    },
  };
}
