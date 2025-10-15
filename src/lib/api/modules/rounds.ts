import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import type { EvaluationCriterion, Round } from "../types";

export interface RoundResponse {
  round: Round;
}

export interface CriteriaResponse {
  criteria: EvaluationCriterion[];
}

export interface RoundsApi {
  getById: (roundId: string, options?: ApiRequestOptions) => Promise<RoundResponse>;
  getCriteria: (
    roundId: string,
    options?: ApiRequestOptions,
  ) => Promise<CriteriaResponse>;
}

export function createRoundsApi(client: ApiClient = apiClient): RoundsApi {
  return {
    getById: (roundId, options) => client.get<RoundResponse>(`/rounds/${roundId}`, options),
    getCriteria: (roundId, options) =>
      client.get<CriteriaResponse>(`/rounds/${roundId}/criteria`, options),
  };
}
