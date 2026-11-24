import MessageDialog from '@components/MessageDialog/MessageDialog';

interface RoomEditMessageDialogProps {
  onClosed: () => void;
}

export function RoomSavedMessageDialog({ onClosed }: RoomEditMessageDialogProps) {
  return (
    <MessageDialog
      title='Komnata zapisana'
      message='Zmiany w komnacie zostały zapisane.'
      open
      onClosed={onClosed}
    />
  );
}

export function MissingInventoryItemMessageDialog({
  onClosed,
}: RoomEditMessageDialogProps) {
  return (
    <MessageDialog
      title='Niedostępny przedmiot'
      message='Komnata zawiera przedmiot, którego nie ma w ekwipunku gry. Usuń go z komnaty i spróbuj ponownie.'
      open
      onClosed={onClosed}
    />
  );
}

export function RoomLoadErrorMessageDialog({
  onClosed,
}: RoomEditMessageDialogProps) {
  return (
    <MessageDialog
      title='Błąd wczytywania'
      message='Nie udało się wczytać danych komnaty. Spróbuj ponownie.'
      open
      onClosed={onClosed}
    />
  );
}

export function RoomSaveErrorMessageDialog({
  onClosed,
}: RoomEditMessageDialogProps) {
  return (
    <MessageDialog
      title='Błąd zapisu'
      message='Nie udało się zapisać komnaty. Sprawdź dane i spróbuj ponownie.'
      open
      onClosed={onClosed}
    />
  );
}
