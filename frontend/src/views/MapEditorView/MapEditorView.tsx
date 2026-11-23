import { useRef, useState } from 'react';
import Button from '@components/Button/Button';
import Card from '@components/Card/Card';
import DropdownField from '@components/DropdownField/DropdownField';
import FormSection from '@components/FormSection/FormSection';
import InputField from '@components/InputField/InputField';
import MessageDialog from '@components/MessageDialog/MessageDialog';
import PageHeader from '@components/PageHeader/PageHeader';
import TextLabel from '@components/TextLabel/TextLabel';
import { useGameDefinition } from '@hooks/useGameDefinition';
import { useMapEditor } from '@hooks/useMapEditor';
import type {
  IMapEditorActions,
  MapEditorDialogTypes,
  MapEditorViewModel,
  PassageDTO,
  PositionDTO,
  RoomDTO,
} from '@app-types/map';
import './MapEditorView.css';
import { resolveRoomDrag } from './MapGeometry';

interface Choice {
  label: string;
  variant?: 'secondary' | 'outline';
  onClick: () => void;
}

interface ChoiceDialogProps {
  title: string;
  message: string;
  choices: Choice[];
}

interface PassageEndpoints {
  start: PositionDTO;
  end: PositionDTO;
}

function ChoiceDialog({ title, message, choices }: ChoiceDialogProps) {
  return (
    <div className='map-editor-view__overlay' role='presentation'>
      <div className='map-editor-view__dialog' role='alertdialog' aria-modal='true'>
        <PageHeader title={title} />
        <TextLabel>{message}</TextLabel>
        <div className='map-editor-view__dialog-actions'>
          {choices.map((choice) => (
            <Button
              key={choice.label}
              variant={choice.variant}
              onClick={choice.onClick}
            >
              {choice.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function describeLastSave(lastSaveTime: Date | null): string {
  if (!lastSaveTime) return 'Nie wykonano jeszcze żadnego zapisu w przeglądarce.';
  const minutes = Math.max(
    0,
    Math.round((Date.now() - lastSaveTime.getTime()) / 60000),
  );
  return `Ostatni zapis w przeglądarce wykonano ${minutes} min temu.`;
}

function getChoiceDialogs(
  actions: IMapEditorActions,
  state: MapEditorViewModel,
  onExit: () => void,
): Record<
  Exclude<MapEditorDialogTypes, 'mapSaved'>,
  { title: string; message: string; choices: Choice[] }
> {
  const exit = () => {
    actions.onExitWithoutSaving();
    onExit();
  };

  return {
    incorrectMapData: {
      title: 'Błąd',
      message:
        'Mapa gry jest niepoprawna (brak wymaganych elementów lub niespójności). ' +
        'Możesz wrócić do edycji albo zapisać mapę jako niepoprawną - nie będzie ' +
        'można opublikować gry, dopóki mapa nie zostanie poprawiona.',
      choices: [
        { label: 'Wróć do edycji', variant: 'secondary', onClick: actions.onReturnToEditing },
        { label: 'Zapisz i wyjdź', onClick: actions.onSaveAsInvalid },
      ],
    },
    saveError: {
      title: 'Błąd',
      message:
        'Nie udało się zapisać mapy gry. Mapa jest zapisana lokalnie w przeglądarce.',
      choices: [
        { label: 'Wyjdź', variant: 'secondary', onClick: exit },
        { label: 'Ponów zapis', onClick: actions.onRetrySystemSave },
      ],
    },
    browserSaveError: {
      title: 'Błąd',
      message: `Nie udało się zapisać mapy w przeglądarce. ${describeLastSave(state.lastSaveTime)}`,
      choices: [
        { label: 'Wyjdź', variant: 'secondary', onClick: exit },
        {
          label: 'Kontynuuj bez zapisu',
          variant: 'outline',
          onClick: actions.onContinueWithoutBrowserSave,
        },
        { label: 'Ponów zapis', onClick: actions.onRetryBrowserSave },
      ],
    },
  };
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));


function getPassageEndpoints(
  passage: PassageDTO,
  room1: RoomDTO,
  room2: RoomDTO,
  customOffsets?: { start: PositionDTO; end: PositionDTO },
): PassageEndpoints {
  const c1 = {
    x: room1.position.x + room1.width / 2,
    y: room1.position.y + room1.height / 2,
  };
  const c2 = {
    x: room2.position.x + room2.width / 2,
    y: room2.position.y + room2.height / 2,
  };
  const mid = {
    x: (c1.x + c2.x) / 2,
    y: (c1.y + c2.y) / 2,
  };

  const shift = {
    x: passage.position.x - mid.x,
    y: passage.position.y - mid.y,
  };

  const startOffset = customOffsets?.start ?? { x: 0, y: 0 };
  const endOffset = customOffsets?.end ?? { x: 0, y: 0 };

  return {
    start: {
      x: c1.x + startOffset.x + shift.x,
      y: c1.y + startOffset.y + shift.y,
    },
    end: {
      x: c2.x + endOffset.x + shift.x,
      y: c2.y + endOffset.y + shift.y,
    },
  };
}

const estimateTextWidth = (text: string, fontSize = 14) =>
  text.length * fontSize * 0.56;

export function MapEditorView() {
  const { state, actions } = useMapEditor();
  const { actions: gameDefinitionActions } = useGameDefinition();

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragOffsetRef = useRef<PositionDTO | null>(null);
  const [passageTarget, setPassageTarget] = useState('');

  const [passageEndpointOffsets, setPassageEndpointOffsets] = useState<
    Record<number, { start: PositionDTO; end: PositionDTO }>
  >({});

  const { map, selectedRoomId, selectedPassageId } = state;
  const container = map.container;
  const selectedRoom = map.rooms.find((r) => r.id === selectedRoomId) ?? null;

  const { passages } = map;
  const roomById = (id: number) => map.rooms.find((r) => r.id === id);

  const openGame = () => gameDefinitionActions.onOpenGame(state.gameId);

  const choiceDialogs = getChoiceDialogs(actions, state, openGame);
  const choiceDialog =
    state.dialogType && state.dialogType !== 'mapSaved'
      ? choiceDialogs[state.dialogType]
      : null;

  const toSvgPoint = (e: React.PointerEvent<SVGElement>): PositionDTO | null => {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return null;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const { x, y } = point.matrixTransform(matrix.inverse());
    return { x, y };
  };

  const handleCanvasInteraction = {
    startRoomDrag: (e: React.PointerEvent<SVGElement>, room: RoomDTO) => {
      const point = toSvgPoint(e);
      if (!point) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragOffsetRef.current = {
        x: point.x - room.position.x,
        y: point.y - room.position.y,
      };
      actions.onRoomSelected(room.id);
    },
    moveRoom: (e: React.PointerEvent<SVGElement>, room: RoomDTO) => {
      const point = toSvgPoint(e);
      const offset = dragOffsetRef.current;
      if (!point || !offset || selectedRoomId !== room.id) return;

      const rect = svgRef.current?.getBoundingClientRect();
      const pxPerUnit = rect && container.width ? rect.width / container.width : 1;

      actions.onSelectedRoomChange({
        position: resolveRoomDrag(
          { x: point.x - offset.x, y: point.y - offset.y },
          room,
          map.rooms,
          container,
          pxPerUnit,
        ),
      });
    },
    startPassageDrag: (e: React.PointerEvent<SVGElement>, passage: PassageDTO) => {
      const point = toSvgPoint(e);
      if (!point) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragOffsetRef.current = {
        x: point.x - passage.position.x,
        y: point.y - passage.position.y,
      };
      actions.onPassageSelected(passage.id);
    },
    movePassage: (e: React.PointerEvent<SVGElement>, passage: PassageDTO) => {
      const point = toSvgPoint(e);
      const offset = dragOffsetRef.current;
      if (!point || !offset || selectedPassageId !== passage.id) {
        return;
      }
      actions.onSelectedPassageChange({
        position: {
          x: clamp(point.x - offset.x, 0, container.width),
          y: clamp(point.y - offset.y, 0, container.height),
        },
      });
    },
    moveEndpoint: (
      e: React.PointerEvent<SVGElement>,
      passage: PassageDTO,
      endpointKey: 'start' | 'end',
      room: RoomDTO,
    ) => {
      if (e.buttons === 0 && !e.currentTarget.hasPointerCapture(e.pointerId)) {
        return;
      }
      const point = toSvgPoint(e);
      if (!point) return;

      const clampedX = clamp(point.x, 0, container.width);
      const clampedY = clamp(point.y, 0, container.height);

      const roomCenter = {
        x: room.position.x + room.width / 2,
        y: room.position.y + room.height / 2,
      };

      setPassageEndpointOffsets((prev) => {
        const current = prev[passage.id] ?? {
          start: { x: 0, y: 0 },
          end: { x: 0, y: 0 },
        };
        return {
          ...prev,
          [passage.id]: {
            ...current,
            [endpointKey]: {
              x: clampedX - roomCenter.x,
              y: clampedY - roomCenter.y,
            },
          },
        };
      });
    },
    endDrag: () => {
      dragOffsetRef.current = null;
    },
  };

  const passageTargetId = Number(passageTarget.match(/^#(\d+)/)?.[1]);

  return (
    <section className='map-editor-view'>
      <Card>
        <PageHeader
          title='Definicja mapy'
          subtitle='Dodawaj komnaty i łącz je przejściami'
        />
        {state.isLoading && <TextLabel>Wczytywanie mapy gry...</TextLabel>}
        {!state.isLoading && state.errorMessage && (
          <TextLabel>{state.errorMessage}</TextLabel>
        )}
        {!state.isLoading && !state.errorMessage && state.isMapMissing && (
          <div className='map-editor-view__empty'>
            <TextLabel>Gra nie ma jeszcze utworzonej mapy.</TextLabel>
            <Button onClick={actions.onGenerateMap}>Wygeneruj nową mapę</Button>
          </div>
        )}
        {!state.isLoading && !state.errorMessage && !state.isMapMissing && (
          <div className='map-editor-view__layout'>
            <svg
              ref={svgRef}
              className='map-editor-view__canvas'
              viewBox={`0 0 ${container.width} ${container.height}`}
            >
              <defs>
                {map.rooms.map((room) => (
                  <clipPath key={`clip-room-${room.id}`} id={`room-clip-${room.id}`}>
                    <rect
                      x={room.position.x}
                      y={room.position.y}
                      width={Math.max(0, room.width)}
                      height={Math.max(0, room.height)}
                    />
                  </clipPath>
                ))}
              </defs>

              <rect
                className='map-editor-view__container'
                x={0}
                y={0}
                width={container.width}
                height={container.height}
              />

              {passages.map((passage) => {
                const room1 = roomById(passage.room1Id);
                const room2 = roomById(passage.room2Id);
                if (!room1 || !room2) return null;

                const { start, end } = getPassageEndpoints(
                  passage,
                  room1,
                  room2,
                  passageEndpointOffsets[passage.id],
                );
                const isSelected = passage.id === selectedPassageId;

                return (
                  <g
                    key={`passage-group-${passage.id}`}
                    className={
                      isSelected
                        ? 'map-editor-view__passage-group--selected'
                        : undefined
                    }
                  >
                    <line
                      className='map-editor-view__passage-line'
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                    />
                    <circle
                      className='map-editor-view__passage-endpoint'
                      cx={start.x}
                      cy={start.y}
                      r={6}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.currentTarget.setPointerCapture(e.pointerId);
                        actions.onPassageSelected(passage.id);
                      }}
                      onPointerMove={(e) =>
                        handleCanvasInteraction.moveEndpoint(
                          e,
                          passage,
                          'start',
                          room1,
                        )
                      }
                      onPointerUp={handleCanvasInteraction.endDrag}
                    />
                    <circle
                      className='map-editor-view__passage-endpoint'
                      cx={end.x}
                      cy={end.y}
                      r={6}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.currentTarget.setPointerCapture(e.pointerId);
                        actions.onPassageSelected(passage.id);
                      }}
                      onPointerMove={(e) =>
                        handleCanvasInteraction.moveEndpoint(
                          e,
                          passage,
                          'end',
                          room2,
                        )
                      }
                      onPointerUp={handleCanvasInteraction.endDrag}
                    />
                  </g>
                );
              })}

              {map.rooms.map((room) => {
                const paddingX = 8;
                const maxTextWidth = Math.max(0, room.width - paddingX * 2);
                const estimatedWidth = estimateTextWidth(room.name);
                const shouldShrink =
                  maxTextWidth > 0 && estimatedWidth > maxTextWidth;

                return (
                  <g key={room.id}>
                    <rect
                      className={`map-editor-view__room${
                        room.id === selectedRoomId
                          ? ' map-editor-view__room--selected'
                          : ''
                      }`}
                      x={room.position.x}
                      y={room.position.y}
                      width={room.width}
                      height={room.height}
                      onPointerDown={(e) =>
                        handleCanvasInteraction.startRoomDrag(e, room)
                      }
                      onPointerMove={(e) =>
                        handleCanvasInteraction.moveRoom(e, room)
                      }
                      onPointerUp={handleCanvasInteraction.endDrag}
                    />
                    <g clipPath={`url(#room-clip-${room.id})`}>
                      <text
                        className='map-editor-view__room-label'
                        x={room.position.x + paddingX}
                        y={room.position.y + Math.min(20, Math.max(14, room.height - 6))}
                        textLength={
                          maxTextWidth > 0 && shouldShrink
                            ? maxTextWidth
                            : undefined
                        }
                        lengthAdjust={
                          maxTextWidth > 0 && shouldShrink
                            ? 'spacingAndGlyphs'
                            : undefined
                        }
                      >
                        {room.name}
                      </text>
                    </g>
                  </g>
                );
              })}

              {passages.map((passage) => {
                const room1 = roomById(passage.room1Id);
                const room2 = roomById(passage.room2Id);
                if (!room1 || !room2) return null;

                const { start, end } = getPassageEndpoints(
                  passage,
                  room1,
                  room2,
                  passageEndpointOffsets[passage.id],
                );
                const handlePos = {
                  x: (start.x + end.x) / 2,
                  y: (start.y + end.y) / 2,
                };

                return (
                  <circle
                    key={`passage-${passage.id}`}
                    className={`map-editor-view__passage${
                      passage.id === selectedPassageId
                        ? ' map-editor-view__passage--selected'
                        : ''
                    }`}
                    cx={handlePos.x}
                    cy={handlePos.y}
                    r={10}
                    onPointerDown={(e) =>
                      handleCanvasInteraction.startPassageDrag(e, passage)
                    }
                    onPointerMove={(e) =>
                      handleCanvasInteraction.movePassage(e, passage)
                    }
                    onPointerUp={handleCanvasInteraction.endDrag}
                  />
                );
              })}
            </svg>
            <div className='map-editor-view__panel'>
              <FormSection title='Wymiary obszaru (container)'>
                <InputField
                  label='Szerokość obszaru'
                  inputProps={{
                    type: 'number',
                    value: container.width,
                    onChange: (e) =>
                      actions.onContainerChange({ width: Number(e.target.value) }),
                  }}
                />
                <InputField
                  label='Wysokość obszaru'
                  inputProps={{
                    type: 'number',
                    value: container.height,
                    onChange: (e) =>
                      actions.onContainerChange({ height: Number(e.target.value) }),
                  }}
                />
              </FormSection>
              <div className='map-editor-view__toolbar'>
                <Button variant='outline' onClick={actions.onAddRoom}>
                  Dodaj komnatę
                </Button>
                <Button
                  variant='secondary'
                  disabled={selectedRoom === null}
                  onClick={actions.onRemoveSelectedRoom}
                >
                  Usuń komnatę
                </Button>
                <Button
                  variant='secondary'
                  disabled={selectedPassageId === null}
                  onClick={actions.onRemoveSelectedPassage}
                >
                  Usuń przejście
                </Button>
              </div>
              {selectedRoom ? (
                <>
                  <FormSection title='Wybrana komnata'>
                    <InputField
                      label='Nazwa'
                      inputProps={{
                        value: selectedRoom.name,
                        onChange: (e) =>
                          actions.onSelectedRoomChange({ name: e.target.value }),
                      }}
                    />
                    <InputField
                      label='Opis'
                      inputProps={{
                        value: selectedRoom.description,
                        onChange: (e) =>
                          actions.onSelectedRoomChange({
                            description: e.target.value,
                          }),
                      }}
                    />
                    <InputField
                      label='Szerokość'
                      inputProps={{
                        type: 'number',
                        value: selectedRoom.width,
                        onChange: (e) =>
                          actions.onSelectedRoomChange({
                            width: Number(e.target.value),
                          }),
                      }}
                    />
                    <InputField
                      label='Wysokość'
                      inputProps={{
                        type: 'number',
                        value: selectedRoom.height,
                        onChange: (e) =>
                          actions.onSelectedRoomChange({
                            height: Number(e.target.value),
                          }),
                      }}
                    />
                    <Button variant='outline' onClick={actions.onEditSelectedRoom}>
                      Edytuj komnatę
                    </Button>
                  </FormSection>
                  <FormSection title='Nowe przejście'>
                    <DropdownField
                      label='Połącz z komnatą'
                      options={map.rooms
                        .filter((r) => r.id !== selectedRoom.id)
                        .map((r) => `#${r.id} ${r.name}`)}
                      value={passageTarget}
                      onOptionSelected={setPassageTarget}
                    />
                    <Button
                      disabled={!passageTarget}
                      onClick={() => {
                        actions.onAddPassage(selectedRoom.id, passageTargetId);
                        setPassageTarget('');
                      }}
                    >
                      Dodaj przejście
                    </Button>
                  </FormSection>
                </>
              ) : (
                <TextLabel>Wybierz komnatę, aby ją edytować lub połączyć.</TextLabel>
              )}
            </div>
          </div>
        )}
        <footer className='map-editor-view__footer'>
          <Button variant='secondary' onClick={openGame}>
            Anuluj
          </Button>
          <Button
            disabled={state.isSubmitting || state.isLoading}
            onClick={actions.onSaveAndExit}
          >
            {state.isSubmitting ? 'Zapisywanie...' : 'Zapisz i wyjdź'}
          </Button>
        </footer>
      </Card>
      <MessageDialog
        title='Sukces'
        message='Mapa gry została zapisana'
        open={state.dialogType === 'mapSaved'}
        onClosed={openGame}
      />
      {choiceDialog && <ChoiceDialog {...choiceDialog} />}
    </section>
  );
}
