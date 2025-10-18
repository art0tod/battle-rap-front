import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import {
  mapModerationSubmissionDetail,
  mapModerationSubmissionList,
  type ApiModerationSubmission,
  type ApiModerationSubmissionListResponse,
} from "../mappers";
import type { ModerationSubmission, ModerationSubmissionList } from "../types";

const MOD_ROOT = "/api/v1/mod";
const SUBMISSIONS_ROOT = `${MOD_ROOT}/submissions`;

export interface ListSubmissionsParams {
  page?: number;
  limit?: number;
  status?: string;
  roundId?: string;
  search?: string;
}

export interface ModeratorApi {
  listSubmissions: (
    params?: ListSubmissionsParams,
    options?: ApiRequestOptions,
  ) => Promise<ModerationSubmissionList>;
  getSubmission: (submissionId: string, options?: ApiRequestOptions) => Promise<ModerationSubmission>;
  publishSubmission: (submissionId: string, options?: ApiRequestOptions) => Promise<void>;
}

export function createModeratorApi(client: ApiClient = apiClient): ModeratorApi {
  return {
    async listSubmissions(params, options) {
      const query = {
        ...(params?.page ? { page: params.page } : {}),
        ...(params?.limit ? { limit: params.limit } : {}),
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.roundId ? { round_id: params.roundId } : {}),
        ...(params?.search ? { search: params.search } : {}),
      };

      const response = await client.get<ApiModerationSubmissionListResponse>(SUBMISSIONS_ROOT, {
        ...(options ?? {}),
        query: {
          ...(options?.query ?? {}),
          ...query,
        },
      });

      return mapModerationSubmissionList(response);
    },
    async getSubmission(submissionId, options) {
      const response = await client.get<ApiModerationSubmission>(
        `${SUBMISSIONS_ROOT}/${submissionId}`,
        options,
      );
      return mapModerationSubmissionDetail(response);
    },
    async publishSubmission(submissionId, options) {
      await client.post<void>(`${SUBMISSIONS_ROOT}/${submissionId}/publish`, undefined, options);
    },
  };
}
