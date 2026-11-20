import type { GameMapDTO } from '@app-types/map';

export interface IMapDraftStorage {
  saveDraft(gameId: string, map: GameMapDTO): void;
  clearDraft(gameId: string): void;
}

const draftKey = (gameId: string) => `map-draft:${gameId}`;

export const mapDraftStorage: IMapDraftStorage = {
  saveDraft: (gameId, map) =>
    window.localStorage.setItem(draftKey(gameId), JSON.stringify(map)),
  clearDraft: (gameId) => window.localStorage.removeItem(draftKey(gameId)),
};