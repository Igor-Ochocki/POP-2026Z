import type { GameMapDTO } from '@app-types/map';
 
export interface IMapDraftStorage {
  saveDraft(gameId: string, map: GameMapDTO): void;
  loadDraft(gameId: string): GameMapDTO | null;
  clearDraft(gameId: string): void;
}
 
const draftKey = (gameId: string) => `map-draft:${gameId}`;
 
const isGameMap = (value: unknown): value is GameMapDTO => {
  const map = value as GameMapDTO | null;
  return (
    typeof map === 'object' &&
    map !== null &&
    typeof map.container?.width === 'number' &&
    typeof map.container?.height === 'number' &&
    Array.isArray(map.rooms) &&
    Array.isArray(map.passages)
  );
};
 
export const mapDraftStorage: IMapDraftStorage = {
  saveDraft: (gameId, map) =>
    window.localStorage.setItem(draftKey(gameId), JSON.stringify(map)),
 
  loadDraft: (gameId) => {
    try {
      const raw = window.localStorage.getItem(draftKey(gameId));
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      return isGameMap(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },
 
  clearDraft: (gameId) => window.localStorage.removeItem(draftKey(gameId)),
};
 
