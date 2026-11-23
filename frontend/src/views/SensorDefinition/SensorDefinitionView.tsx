import './SensorDefinitionView.css';
import { useSensorDefinition } from '@hooks/useSensorDefinition.ts';
import PageHeader from '@components/PageHeader/PageHeader.tsx';
import DropdownField from '@components/DropdownField/DropdownField.tsx';
import InputField from '@components/InputField/InputField.tsx';
import Button from '@components/Button/Button';
import Card from '@components/Card/Card.tsx';
import { useRef, useState } from 'react';
import type {
  SensorDefinitionActions,
  SensorDefinitionViewModel,
} from '@/types/sensor.ts';
import type { PositionDTO } from '@/types/map.ts';
import MessageDialog from '@components/MessageDialog/MessageDialog.tsx';

function SensorPositionSelector({
  state,
  actions,
}: {
  state: SensorDefinitionViewModel;
  actions: SensorDefinitionActions;
}) {
  const room = state.gameMap.rooms.find(
    (room) => room.id === Number(state.roomId),
  );
  const [circlePos, setCirclePos] = useState<PositionDTO | null>(null);
  if (!room) {
    return null;
  }
  const svgRef = useRef<SVGSVGElement | null>(null);
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    const local = pt.matrixTransform(ctm.inverse());
    const nextPos: PositionDTO = {
      x: Math.round(local.x),
      y: Math.round(local.y),
    };

    setCirclePos(nextPos);
  };
  return (
    <div className='sensor-definition-view__position-selector'>
      <Card>
        <div className='sensor-definition-view__position-selector-layout'>
          <PageHeader title={'Wybierz pozycję'} />
          <svg
            ref={svgRef}
            width={room.width}
            height={room.height}
            viewBox={`0 0 ${room.width} ${room.height}`}
            onClick={handleClick}
            style={{
              border: '2px solid #1e293b',
              backgroundColor: '#f8fafc',
              cursor: 'crosshair',
              display: 'block',
            }}
          >
            <rect
              width={room.width}
              height={room.height}
              fill={`url(#grid-${room.id})`}
            />

            <rect
              x={0}
              y={0}
              width={room.width}
              height={room.height}
              fill='transparent'
              stroke='#0f172a'
              strokeWidth={2}
            />

            {room.passages.map((passage) => {
              const nearTop = passage.position.y < 36;
              const nearRight = passage.position.x > room.width - 140;

              const textY = nearTop ? 28 : -14;
              const textX = nearRight ? -8 : 12;
              const anchor: 'start' | 'end' = nearRight ? 'end' : 'start';

              return (
                <g
                  key={passage.id}
                  transform={`translate(${passage.position.x}, ${passage.position.y})`}
                >
                  <circle r={10} fill='#2563eb' />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor={anchor}
                    fontSize={24}
                    fill='#1e3a8a'
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    Przejście do:{' '}
                    {
                      state.gameMap.rooms.find(
                        (r) =>
                          r.id ===
                          (passage.room1Id === Number(state.roomId)
                            ? passage.room2Id
                            : passage.room1Id),
                      )?.name
                    }
                  </text>
                </g>
              );
            })}
            {circlePos && (
              <g transform={`translate(${circlePos.x}, ${circlePos.y})`}>
                <circle r={8} fill='red' />
                <text
                  y={-12}
                  textAnchor='middle'
                  fontSize={12}
                  fill='black'
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  Nowa pozycja
                </text>
              </g>
            )}
          </svg>
          <Button
            variant={'secondary'}
            onClick={() => {
              actions.onChangeParameter('positionSelectorOpen', false);
            }}
          >
            Anuluj
          </Button>
          <Button
            onClick={() => {
              actions.onChangeParameter('selectedPosition', circlePos);
              actions.onChangeParameter('positionSelectorOpen', false);
            }}
          >
            Zapisz i zamknij
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function SensorDefinitionView() {
  const { state, actions } = useSensorDefinition();
  return (
    <div className='sensor-definition-view'>
      <Card>
        <div className='sensor-definition-view__layout'>
          <PageHeader title={'Nowy czujnik'} />
          <InputField
            label={'Pozycja czujnika'}
            inputProps={{
              onChange: () => {},
              value:
                state.selectedPosition === null
                  ? 'nie wybrano'
                  : JSON.stringify(state.selectedPosition),
            }}
          />
          <Button
            onClick={() => {
              actions.onChangeParameter('positionSelectorOpen', true);
            }}
          >
            Wybierz
          </Button>
          <DropdownField
            label={'Typ czujnika'}
            options={state.sensorTypes}
            onOptionSelected={(e) =>
              actions.onChangeParameter('selectedType', e)
            }
          />
          <DropdownField
            label={'Akcja'}
            options={state.actions.map((v) => v.name)}
            onOptionSelected={(e) =>{
              const a = state.actions.find((v)=>v.name === e)
              actions.onChangeParameter('selectedAction', a?.actionId)
            }}
          />
          <Button variant={'secondary'} onClick={actions.onCreateSensorCancel}>
            Anuluj
          </Button>
          <Button onClick={actions.onSensorSubmit}>Zapisz i zamknij</Button>
        </div>
      </Card>
      {state.positionSelectorOpen && (
        <SensorPositionSelector state={state} actions={actions} />
      )}
      <MessageDialog
        title={'Błąd'}
        message={'Podane dane czujnika są nieprawidłowe'}
        open={state.dataErrorDialogOpen}
        onClosed={() => actions.onChangeParameter('dataErrorDialogOpen', false)}
      />
      <MessageDialog
        title={'Błąd'}
        message={'Wystąpił błąd zapisu'}
        open={state.saveErrorDialogOpen}
        onClosed={() => actions.onChangeParameter('saveErrorDialogOpen', false)}
      />
      <MessageDialog
        title={'Sukces'}
        message={'Nowy czujnik został dodany'}
        open={state.saveSuccessDialogOpen}
        onClosed={() =>
          actions.onChangeParameter('saveSuccessDialogOpen', false)
        }
      />
    </div>
  );
}
