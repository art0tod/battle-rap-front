import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import { mapPublicBattleList, type ApiPublicBattleListResponse } from "../mappers";
import type { PublicBattleList, PublicBattleStatusFilter } from "../types";

const BATTLES_ROOT = "/api/v1/battles";

export interface ListPublicBattlesParams {
  status?: PublicBattleStatusFilter;
  limit?: number;
}

export interface PublicBattlesApi {
  list: (params?: ListPublicBattlesParams, options?: ApiRequestOptions) => Promise<PublicBattleList>;
}

function buildQuery(params?: ListPublicBattlesParams) {
  if (!params) {
    return undefined;
  }
  const query: Record<string, string | number> = {};
  if (params.status) {
    query.status = params.status;
  }
  if (typeof params.limit === "number") {
    query.limit = params.limit;
  }
  return query;
}

export function createPublicBattlesApi(client: ApiClient = apiClient): PublicBattlesApi {
  return {
    async list(params, options) {
      const response = await client.get<ApiPublicBattleListResponse>(BATTLES_ROOT, {
        ...options,
        query: buildQuery(params),
      });
      return mapPublicBattleList(response);
    },
  };
}
