import { useDisplayActions } from '@hooks/useDisplayActions';
import './DisplayActionsView.css';
import SubtitledList from '@components/SubtitledList/SubtitledList';
import { actionTypeDisplay, effectKindDisplay } from '@app-types/action';

export function DisplayActionsView() {
  const {
    state: { actions },
  } = useDisplayActions();

  return (
    <div className='display-actions-view'>
      <SubtitledList
        items={actions.map(
          ({ actionType, name, outcomeType, outcomeValue }) => ({
            label: name,
            subtitle: actionTypeDisplay(actionType),
            text: `efekt: ${effectKindDisplay(outcomeType)} ${outcomeValue}`,
          }),
        )}
      />
    </div>
  );
}
