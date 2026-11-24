import type { MapContainerDTO, PositionDTO, RoomDTO } from '@app-types/map';

// Odległość (w pikselach ekranu), z której krawędź komnaty "przyciąga się"
// do krawędzi innej komnaty lub brzegu obszaru.
const SNAP_DISTANCE_PX = 12;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

function overlaps(pos: PositionDTO, room: RoomDTO, other: RoomDTO): boolean {
  return (
    pos.x < other.position.x + other.width &&
    pos.x + room.width > other.position.x &&
    pos.y < other.position.y + other.height &&
    pos.y + room.height > other.position.y
  );
}

function clampToContainer(
  pos: PositionDTO,
  room: RoomDTO,
  container: MapContainerDTO,
): PositionDTO {
  return {
    x: clamp(pos.x, 0, Math.max(0, container.width - room.width)),
    y: clamp(pos.y, 0, Math.max(0, container.height - room.height)),
  };
}

function nearest(value: number, targets: number[], threshold: number): number {
  let best = value;
  let bestDistance = threshold;
  for (const target of targets) {
    const distance = Math.abs(target - value);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = target;
    }
  }
  return best;
}

// Przyciąga krawędzie przeciąganej komnaty do krawędzi sąsiadów i brzegów obszaru.
function snapToEdges(
  pos: PositionDTO,
  room: RoomDTO,
  others: RoomDTO[],
  container: MapContainerDTO,
  threshold: number,
): PositionDTO {
  const xTargets = [0, container.width - room.width];
  const yTargets = [0, container.height - room.height];
  for (const other of others) {
    xTargets.push(
      other.position.x + other.width, // moja lewa krawędź przy prawej sąsiada
      other.position.x - room.width, // moja prawa krawędź przy lewej sąsiada
      other.position.x, // wyrównanie lewych krawędzi
      other.position.x + other.width - room.width, // wyrównanie prawych
    );
    yTargets.push(
      other.position.y + other.height,
      other.position.y - room.height,
      other.position.y,
      other.position.y + other.height - room.height,
    );
  }
  return {
    x: nearest(pos.x, xTargets, threshold),
    y: nearest(pos.y, yTargets, threshold),
  };
}

// Wypycha komnatę z nachodzących komnat wzdłuż osi o najmniejszym zagłębieniu,
// dzięki czemu można "ślizgać się" wzdłuż sąsiada zamiast się na nim blokować.
function pushOutOfRooms(
  pos: PositionDTO,
  room: RoomDTO,
  others: RoomDTO[],
): PositionDTO {
  let { x, y } = pos;
  for (let i = 0; i <= others.length; i += 1) {
    const hit = others.find((other) => overlaps({ x, y }, room, other));
    if (!hit) return { x, y };
    const left = x + room.width - hit.position.x;
    const right = hit.position.x + hit.width - x;
    const up = y + room.height - hit.position.y;
    const down = hit.position.y + hit.height - y;
    const min = Math.min(left, right, up, down);
    if (min === left) x -= left;
    else if (min === right) x += right;
    else if (min === up) y -= up;
    else y += down;
  }
  return { x, y };
}

/**
 * Wyznacza pozycję przeciąganej komnaty: ogranicza do obszaru, przyciąga
 * krawędzie w pobliżu innych komnat, a nachodzenie rozwiązuje wypchnięciem.
 * @param pxPerUnit liczba pikseli ekranu przypadająca na jednostkę mapy
 */
export function resolveRoomDrag(
  target: PositionDTO,
  room: RoomDTO,
  rooms: RoomDTO[],
  container: MapContainerDTO,
  pxPerUnit: number,
): PositionDTO {
  const others = rooms.filter((r) => r.id !== room.id);
  const threshold = SNAP_DISTANCE_PX / (pxPerUnit > 0 ? pxPerUnit : 1);

  const clamped = clampToContainer(target, room, container);
  const snapped = snapToEdges(clamped, room, others, container, threshold);
  const resolved = clampToContainer(
    pushOutOfRooms(snapped, room, others),
    room,
    container,
  );

  // zabezpieczenie: jeśli po korekcie nadal jest nachodzenie, zostajemy w miejscu
  return others.some((other) => overlaps(resolved, room, other))
    ? room.position
    : resolved;
}
