import type { AxiosInstance } from 'axios';
import { ApiError } from '@api/apiError';
import type { ActionDto, ActionType, EffectKind } from '@app-types/action';
 

export class ActionValidationError extends Error {
  constructor() {
    super('Dane akcji są niekompletne');
    this.name = 'ActionValidationError';
  }
}
 
interface ActionRequestPayload {
  game_id: string;
  name: string;
  action_type: string;
  outcome_type: string;
  outcome_value: string;
}
 
interface ActionResponsePayload {
  action_id: string;
  game_id: string;
  name: string;
  action_type: string;
  outcome_type: string;
  outcome_value: string;
}

const toCamel = (value: string): string =>
  value.toLowerCase().replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
 
 
const toActionRequest = (
  gameId: string,
  action: ActionDto,
): ActionRequestPayload => ({
  game_id: gameId,
  name: action.name,
  action_type: action.type,
  outcome_type: action.effectKind,
  outcome_value: action.effectValue,
});
 
const fromActionResponse = (action: ActionResponsePayload): ActionDto => ({
  id: action.action_id,
  gameId: action.game_id,
  name: action.name,
  type: action.action_type as ActionDto['type'],
  effectKind: action.outcome_type as ActionDto['effectKind'],
  effectValue: action.outcome_value,
});
 

const isValidationFailure = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 422;
 
export const createActionsApi = (http: AxiosInstance) => ({
  createAction: async (
    gameId: string,
    action: ActionDto,
  ): Promise<ActionDto> => {
    try {
      const { data } = await http.post<ActionResponsePayload>(
        '/actions/',
        toActionRequest(gameId, action),
      );
      return fromActionResponse(data);
    } catch (error) {
      if (isValidationFailure(error)) throw new ActionValidationError();
      throw error;
    }
  },
 
  getAction: async (actionId: string): Promise<ActionDto> => {
    const { data } = await http.get<ActionResponsePayload>(
      `/actions/${actionId}`,
    );
    return fromActionResponse(data);
  },
 
  getActionTypes: async (): Promise<ActionType[]> => {
    const { data } = await http.get<string[]>('/actions/action_types');
    return data as ActionType[];
  },
 
  getEffectKinds: async (): Promise<EffectKind[]> => {
    const { data } = await http.get<string[]>('/actions/effect_kind');
    return data as EffectKind[];
  },
});
 
export type ActionsApi = ReturnType<typeof createActionsApi>;
