import { useDisplayActions } from '@hooks/useDisplayActions';
import './DisplayActionsView.css';
import SubtitledList from '@components/SubtitledList/SubtitledList';
import TextLabel from '@components/TextLabel/TextLabel';
import Button from '@components/Button/Button';
import { useGameDefinition } from '@hooks/useGameDefinition';
import { actionTypeLabels, effectKindLabels } from '@app-types/action';

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
              subtitle: actionTypeLabels[actionType],
              text: `efekt: ${effectKindLabels[outcomeType]} ${outcomeValue}`,
            }),
          )}
        />
      ) : (
        <TextLabel>Nie zdefiniowano jeszcze żadnych akcji</TextLabel>
      )}
      <div className='display-actions-view__back'>
        <Button variant='secondary' onClick={() => onOpenGame(gameId)}>
          Zamknij
        </Button>
      </div>
    </div>
  );
}
