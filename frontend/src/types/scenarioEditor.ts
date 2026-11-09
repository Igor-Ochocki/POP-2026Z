import type { GameMetadataDTO } from '@app-types/game';
import type { TaskDTO } from '@app-types/task';

export interface ScenarioDetailDTO {
  scenarioId: string;
  gameId: string;
  tasks: TaskDTO[];
  victoryConditions: string[];
}

export interface ScenarioEditorViewModel {
  activeGame: GameMetadataDTO | null;
  scenario: ScenarioDetailDTO | null;
  isLoading: boolean;
  errorMessage: string | null;
}

export interface IScenarioEditorActions {
  onOpenScenarioEditor(gameId: string): void;
  onReloadScenario(): void;
}

export interface IScenarioEditorWindows {
  showScenarioEditorView(gameId: string): void;
}
