import type { AxiosInstance } from 'axios';
import type {
  ActionCreateDTO,
  ActionDTO,
  ActionType,
  EffectKind,
} from '@app-types/action';

export interface IActionsApi {
  createAction(action: ActionCreateDTO): Promise<ActionDTO>;
}

// Backend payloads (ActionCreateSchema / ActionSchema) - snake_case stays inside this module.
interface ActionCreatePayload {
  game_id: string;
  name: string;
  action_type: string;
  outcome_type: string;
  outcome_value: string;
}

interface ActionResponsePayload extends ActionCreatePayload {
  action_id: string;
}

const toCreatePayload = (dto: ActionCreateDTO): ActionCreatePayload => ({
  game_id: dto.gameId,
  name: dto.name,
  action_type: dto.actionType,
  outcome_type: dto.outcomeType,
  outcome_value: dto.outcomeValue,
});

const fromResponsePayload = (data: ActionResponsePayload): ActionDTO => ({
  actionId: data.action_id,
  gameId: data.game_id,
  name: data.name,
  actionType: data.action_type as ActionType,
  outcomeType: data.outcome_type as EffectKind,
  outcomeValue: data.outcome_value,
});

export const createActionsApi = (http: AxiosInstance): IActionsApi => ({
  createAction: async (action) => {
    const { data } = await http.post<ActionResponsePayload>(
      '/actions',
      toCreatePayload(action),
    );
    return fromResponsePayload(data);
  },
});
