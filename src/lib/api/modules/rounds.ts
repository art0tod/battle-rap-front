import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import { mapRoundOverview, type ApiRoundOverview } from "../mappers";
import type { RoundOverview } from "../types";

const ROUNDS_ROOT = "/api/v1/rounds";

export interface RoundsApi {
  getOverview: (roundId: string, options?: ApiRequestOptions) => Promise<RoundOverview>;
}

export function createRoundsApi(client: ApiClient = apiClient): RoundsApi {
  return {
    async getOverview(roundId, options) {
      const response = await client.get<ApiRoundOverview>(`${ROUNDS_ROOT}/${roundId}/overview`, options);
      return mapRoundOverview(response);
    },
  };
}
