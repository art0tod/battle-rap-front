import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import {
  mapPublicParticipantsResponse,
  type ApiPublicParticipantsResponse,
} from "../mappers";
import type { PublicParticipantsList } from "../types";

const PUBLIC_PARTICIPANTS_ROOT = "/api/v1/artists";

export interface ListPublicParticipantsParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "artist" | "judge";
  sort?: "joined_at" | "wins" | "rating";
}

export interface PublicParticipantsApi {
  list: (
    params?: ListPublicParticipantsParams,
    options?: ApiRequestOptions,
  ) => Promise<PublicParticipantsList>;
}

export function createPublicParticipantsApi(client: ApiClient = apiClient): PublicParticipantsApi {
  return {
    async list(params, options) {
      const query = {
        ...(params?.page ? { page: params.page } : {}),
        ...(params?.limit ? { limit: params.limit } : {}),
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.role ? { role: params.role } : {}),
        ...(params?.sort ? { sort: params.sort } : {}),
      };

      const response = await client.get<ApiPublicParticipantsResponse>(
        PUBLIC_PARTICIPANTS_ROOT,
        {
          ...(options ?? {}),
          query: {
            ...(options?.query ?? {}),
            ...query,
          },
        },
      );

      return mapPublicParticipantsResponse(response);
    },
  };
}
