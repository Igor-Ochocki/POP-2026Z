import { useState, type PointerEvent as ReactPointerEvent } from 'react';
import Button from '@components/Button/Button';
import Input from '@components/Input/Input';
import type {
  IRoomEditActions,
  InventoryItemDTO,
  PositionDTO,
  QrCodeDTO,
  RoomDTO,
  SensorDTO,
} from '@app-types/roomEdit';
import './RoomEditPanel.css';

const MAX_CANVAS_WIDTH = 600;
const MAX_CANVAS_HEIGHT = 450;
const MAX_CELL_SIZE = 4;

type MarkerKind = 'sensors' | 'qrCodes';

interface SelectedMarker {
  kind: MarkerKind;
  index: number;
}

interface RoomEditPanelProps extends Pick<
  IRoomEditActions,
  'onChangeRoomData' | 'onSaveChanges'
> {
  room: RoomDTO;
  sensors: SensorDTO[];
  qrCodes: QrCodeDTO[];
  availableItems: InventoryItemDTO[];
  isSaving: boolean;
}

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

export function RoomEditPanel({
  room,
  sensors,
  qrCodes,
  availableItems,
  isSaving,
  onChangeRoomData,
  onSaveChanges,
}: RoomEditPanelProps) {
  const [selected, setSelected] = useState<SelectedMarker | null>(null);
  const [dragged, setDragged] = useState<SelectedMarker | null>(null);
  const cellSize =
    room.width > 0 && room.height > 0
      ? Math.min(
          MAX_CANVAS_WIDTH / room.width,
          MAX_CANVAS_HEIGHT / room.height,
          MAX_CELL_SIZE,
        )
      : 1;

  const markerStyle = (position: PositionDTO) => ({
    left: position.x * cellSize,
    top: position.y * cellSize,
  });

  const markersOf = (kind: MarkerKind): { position: PositionDTO }[] =>
    kind === 'sensors' ? sensors : qrCodes;

  const pointerToPosition = (
    event: ReactPointerEvent<HTMLDivElement>,
  ): PositionDTO => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: clamp(Math.round((event.clientX - rect.left) / cellSize), room.width),
      y: clamp(Math.round((event.clientY - rect.top) / cellSize), room.height),
    };
  };

  const startDrag =
    (kind: MarkerKind, index: number) =>
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragged({ kind, index });
      setSelected({ kind, index });
    };

  const moveDragged = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragged) return;
    const position = pointerToPosition(event);
    const updated = markersOf(dragged.kind).map((marker, index) =>
      index === dragged.index ? position : marker.position,
    );
    onChangeRoomData(dragged.kind, updated);
  };

  const endDrag = () => setDragged(null);

  const addMarker = (kind: MarkerKind) => {
    const centre: PositionDTO = {
      x: Math.floor(room.width / 2),
      y: Math.floor(room.height / 2),
    };
    const markers = markersOf(kind);
    onChangeRoomData(kind, [...markers.map((marker) => marker.position), centre]);
    setSelected({ kind, index: markers.length });
  };

  const removeSelected = () => {
    if (!selected) return;
    const remaining = markersOf(selected.kind)
      .filter((_, index) => index !== selected.index)
      .map((marker) => marker.position);
    onChangeRoomData(selected.kind, remaining);
    setSelected(null);
  };

  const toggleItem = (item: InventoryItemDTO, checked: boolean) => {
    const items = checked
      ? [...room.items, item]
      : room.items.filter((roomItem) => roomItem.itemId !== item.itemId);
    onChangeRoomData('items', items);
  };

  const isAvailable = (itemId: string) =>
    availableItems.some((item) => item.itemId === itemId);

  // Items no longer in the inventory stay listed, so the user can remove them.
  const itemOptions = [
    ...availableItems,
    ...room.items.filter((item) => !isAvailable(item.itemId)),
  ];

  return (
    <div className='room-edit-panel'>
      <form
        className='room-edit-panel__form'
        onSubmit={(event) => {
          event.preventDefault();
          onSaveChanges();
        }}
      >
        <label className='room-edit-panel__field'>
          <span>Nazwa</span>
          <Input
            name='name'
            value={room.name}
            placeholder='Nazwa komnaty'
            required
            error={room.name.trim().length === 0}
            onChange={(event) =>
              onChangeRoomData('name', event.target.value)
            }
          />
        </label>

        <label className='room-edit-panel__field'>
          <span>Opis</span>
          <textarea
            className='room-edit-panel__textarea'
            name='description'
            value={room.description}
            onChange={(event) =>
              onChangeRoomData('description', event.target.value)
            }
          />
        </label>

        <label className='room-edit-panel__field'>
          <span>Strefa</span>
          <Input
            name='zone'
            value={room.zone}
            placeholder='Nazwa strefy'
            onChange={(event) => onChangeRoomData('zone', event.target.value)}
          />
        </label>

        <label className='room-edit-panel__checkbox'>
          <input
            type='checkbox'
            checked={room.hidden}
            onChange={(event) =>
              onChangeRoomData('hidden', event.target.checked)
            }
          />
          <span>Ukryta komnata</span>
        </label>

        <fieldset className='room-edit-panel__items'>
          <legend>Przedmioty</legend>
          {itemOptions.length === 0 && <p>Brak przedmiotów w ekwipunku.</p>}
          {itemOptions.map((item) => {
            const checked = room.items.some(
              (roomItem) => roomItem.itemId === item.itemId,
            );
            const unavailable = !isAvailable(item.itemId);
            return (
              <label
                key={item.itemId}
                className='room-edit-panel__checkbox'
              >
                <input
                  type='checkbox'
                  checked={checked}
                  onChange={(event) => toggleItem(item, event.target.checked)}
                />
                <span>
                  {item.name}
                  {unavailable && ' (niedostępny)'}
                </span>
              </label>
            );
          })}
        </fieldset>

        <p className='room-edit-panel__size'>
          Szerokość: {room.width} · Wysokość: {room.height}
        </p>

        <Button type='submit' disabled={isSaving}>
          {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </Button>
      </form>

      <section className='room-edit-panel__plan-section'>
        <div className='room-edit-panel__tools'>
          <Button variant='secondary' onClick={() => addMarker('sensors')}>
            Dodaj czujnik
          </Button>
          <Button variant='secondary' onClick={() => addMarker('qrCodes')}>
            Dodaj kod QR
          </Button>
          <Button
            variant='danger'
            onClick={removeSelected}
            disabled={selected === null}
          >
            Usuń zaznaczony
          </Button>
        </div>

        <div
          className='room-edit-panel__plan'
          role='application'
          aria-label='Plan komnaty'
          style={{
            width: room.width * cellSize,
            height: room.height * cellSize,
            backgroundSize: `${cellSize}px ${cellSize}px`,
          }}
          onPointerDown={() => setSelected(null)}
          onPointerMove={moveDragged}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {room.passages.map((passage) => {
            const target =
              passage.room1Id === room.id ? passage.room2Id : passage.room1Id;
            return (
              <span
                key={passage.id}
                className='room-edit-panel__passage'
                style={markerStyle(passage.position)}
              >
                Przejście → komnata {target}
              </span>
            );
          })}

          {sensors.map((sensor, index) => (
            <button
              key={`sensor-${index}`}
              type='button'
              className={`room-edit-panel__marker room-edit-panel__marker--sensor${
                selected?.kind === 'sensors' && selected.index === index
                  ? ' room-edit-panel__marker--selected'
                  : ''
              }`}
              style={markerStyle(sensor.position)}
              aria-label={`Czujnik ${index + 1}`}
              onPointerDown={startDrag('sensors', index)}
            >
              C
            </button>
          ))}

          {qrCodes.map((qrCode, index) => (
            <button
              key={`qr-${index}`}
              type='button'
              className={`room-edit-panel__marker room-edit-panel__marker--qr${
                selected?.kind === 'qrCodes' && selected.index === index
                  ? ' room-edit-panel__marker--selected'
                  : ''
              }`}
              style={markerStyle(qrCode.position)}
              aria-label={`Kod QR ${index + 1}`}
              onPointerDown={startDrag('qrCodes', index)}
            >
              QR
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
