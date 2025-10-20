import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import type { MatchStatus } from "@/lib/statuses";
import {
  mapAdminBattle,
  mapAdminBattleList,
  type ApiAdminBattle,
  type ApiAdminBattleListResponse,
} from "../mappers";
import type {
  AdminBattle,
  AdminBattleList,
} from "../types";

const ADMIN_BATTLES_ROOT = "/api/v1/admin/battles";

export interface ListAdminBattlesParams {
  page?: number;
  limit?: number;
  status?: MatchStatus;
  roundId?: string;
  tournamentId?: string;
}

export interface AdminBattleParticipantInput {
  participantId: string;
  seed?: number | null;
}

export interface CreateAdminBattlePayload {
  roundId: string;
  startsAt?: string | null;
  endsAt?: string | null;
  status?: MatchStatus;
  participants: AdminBattleParticipantInput[];
}

export interface UpdateAdminBattlePayload {
  roundId?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  status?: MatchStatus;
  participants?: AdminBattleParticipantInput[];
}

function serializeParticipants(participants: AdminBattleParticipantInput[]) {
  return participants.map((entry) => ({
    participant_id: entry.participantId,
    seed: entry.seed ?? null,
  }));
}

function serializeCreatePayload(payload: CreateAdminBattlePayload) {
  return {
    round_id: payload.roundId,
    starts_at: payload.startsAt ?? null,
    ends_at: payload.endsAt ?? null,
    status: payload.status,
    participants: serializeParticipants(payload.participants),
  };
}

function serializeUpdatePayload(payload: UpdateAdminBattlePayload) {
  const body: Record<string, unknown> = {};
  if (payload.roundId !== undefined) {
    body.round_id = payload.roundId;
  }
  if (payload.startsAt !== undefined) {
    body.starts_at = payload.startsAt;
  }
  if (payload.endsAt !== undefined) {
    body.ends_at = payload.endsAt;
  }
  if (payload.status !== undefined) {
    body.status = payload.status;
  }
  if (payload.participants !== undefined) {
    body.participants = serializeParticipants(payload.participants);
  }
  return body;
}

export interface AdminBattlesApi {
  list: (params?: ListAdminBattlesParams, options?: ApiRequestOptions) => Promise<AdminBattleList>;
  get: (battleId: string, options?: ApiRequestOptions) => Promise<AdminBattle>;
  create: (payload: CreateAdminBattlePayload, options?: ApiRequestOptions) => Promise<AdminBattle>;
  update: (
    battleId: string,
    payload: UpdateAdminBattlePayload,
    options?: ApiRequestOptions,
  ) => Promise<AdminBattle>;
  remove: (battleId: string, options?: ApiRequestOptions) => Promise<void>;
}

export function createAdminBattlesApi(client: ApiClient = apiClient): AdminBattlesApi {
  return {
    async list(params, options) {
      const query = {
        ...(params?.page ? { page: params.page } : {}),
        ...(params?.limit ? { limit: params.limit } : {}),
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.roundId ? { round_id: params.roundId } : {}),
        ...(params?.tournamentId ? { tournament_id: params.tournamentId } : {}),
      };
      const response = await client.get<ApiAdminBattleListResponse>(ADMIN_BATTLES_ROOT, {
        ...(options ?? {}),
        query: {
          ...(options?.query ?? {}),
          ...query,
        },
      });
      return mapAdminBattleList(response);
    },
    async get(battleId, options) {
      const response = await client.get<ApiAdminBattle>(`${ADMIN_BATTLES_ROOT}/${battleId}`, options);
      return mapAdminBattle(response);
    },
    async create(payload, options) {
      const response = await client.post<ApiAdminBattle>(
        ADMIN_BATTLES_ROOT,
        serializeCreatePayload(payload),
        options,
      );
      return mapAdminBattle(response);
    },
    async update(battleId, payload, options) {
      const response = await client.patch<ApiAdminBattle>(
        `${ADMIN_BATTLES_ROOT}/${battleId}`,
        serializeUpdatePayload(payload),
        options,
      );
      return mapAdminBattle(response);
    },
    async remove(battleId, options) {
      await client.delete<void>(`${ADMIN_BATTLES_ROOT}/${battleId}`, options);
    },
  };
}
