import { RoomEditDialogTypes } from '@app-types/roomEdit';
import { useRoomEdit } from '@hooks/useRoomEdit';
import {
  MissingInventoryItemMessageDialog,
  RoomLoadErrorMessageDialog,
  RoomSaveErrorMessageDialog,
  RoomSavedMessageDialog,
} from './RoomEditMessageDialogs';
import { RoomEditPanel } from './RoomEditPanel';
import './RoomEditView.css';

export function RoomEditView() {
  const { state, actions } = useRoomEdit();

  return (
    <main className='room-edit-page'>
      <header className='room-edit-page__header'>
        <h1>Edycja komnaty</h1>
      </header>

      {state.isLoading && (
        <p className='room-edit-page__status' role='status'>
          Wczytywanie komnaty...
        </p>
      )}

      {state.room && (
        <RoomEditPanel
          room={state.room}
          sensors={state.sensors}
          qrCodes={state.qrCodes}
          availableItems={state.availableItems}
          isSaving={state.isSaving}
          onChangeRoomData={actions.onChangeRoomData}
          onSaveChanges={actions.onSaveChanges}
        />
      )}

      {state.dialogType === RoomEditDialogTypes.roomSaved && (
        <RoomSavedMessageDialog
          onClosed={actions.onRoomSavedMessageDialogConfirm}
        />
      )}
      {state.dialogType === RoomEditDialogTypes.missingInventoryItem && (
        <MissingInventoryItemMessageDialog
          onClosed={actions.onMissingInventoryItemMessageDialogConfirm}
        />
      )}
      {state.dialogType === RoomEditDialogTypes.loadError && (
        <RoomLoadErrorMessageDialog
          onClosed={actions.onRoomLoadErrorMessageDialogConfirm}
        />
      )}
      {state.dialogType === RoomEditDialogTypes.saveError && (
        <RoomSaveErrorMessageDialog
          onClosed={actions.onRoomSaveErrorMessageDialogConfirm}
        />
      )}
    </main>
  );
}
