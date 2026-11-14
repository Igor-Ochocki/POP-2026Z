import { useDisplayActions } from '@hooks/useDisplayActions';
import './DisplayActionsView.css';
import SubtitledList from '@components/SubtitledList/SubtitledList';
import { actionTypeDisplay, effectKindDisplay } from '@app-types/action';
import TextLabel from '@components/TextLabel/TextLabel';
import Button from '@components/Button/Button';
import { useGameDefinition } from '@hooks/useGameDefinition';

export function DisplayActionsView() {
  const {
    state: { actions, gameId },
  } = useDisplayActions();

  const {
    actions: { onOpenGame },
  } = useGameDefinition();

  return (
    <div className='display-actions-view'>
      {actions.length > 0 ? (
        <SubtitledList
          items={actions.map(
            ({ actionType, name, outcomeType, outcomeValue }) => ({
              label: name,
              subtitle: actionTypeDisplay(actionType),
              text: `efekt: ${effectKindDisplay(outcomeType)} ${outcomeValue}`,
            }),
          )}
        />
      ) : (
        <TextLabel>Nie zdefiniowano jeszcze żadnych akcji</TextLabel>
      )}
      <Button variant='secondary' onClick={() => onOpenGame(gameId)}>
        Zamknij
      </Button>
    </div>
  );
}
