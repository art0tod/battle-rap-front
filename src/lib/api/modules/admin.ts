import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import type {
  DashboardStats,
  MediaAsset,
  MediaKind,
  Submission,
  SubmissionStatus,
  User,
} from "../types";

export interface DashboardResponse {
  stats: DashboardStats;
}

export interface AdminUsersResponse {
  users: User[];
}

export interface ModerateSubmissionPayload {
  locked: boolean;
  status?: SubmissionStatus;
}

export interface SubmissionResponse {
  submission: Submission;
}

export interface RegisterMediaAssetPayload {
  kind: MediaKind;
  storageKey: string;
  mime: string;
  sizeBytes: number;
  durationSec?: number;
}

export interface MediaAssetResponse {
  media: MediaAsset;
}

export interface MediaAssetsResponse {
  mediaAssets: MediaAsset[];
}

export interface ListMediaAssetsParams {
  kind?: MediaKind;
}

export interface AdminApi {
  getDashboard: (options?: ApiRequestOptions) => Promise<DashboardResponse>;
  listUsers: (options?: ApiRequestOptions) => Promise<AdminUsersResponse>;
  moderateSubmission: (
    submissionId: string,
    payload: ModerateSubmissionPayload,
    options?: ApiRequestOptions,
  ) => Promise<SubmissionResponse>;
  registerMediaAsset: (
    payload: RegisterMediaAssetPayload,
    options?: ApiRequestOptions,
  ) => Promise<MediaAssetResponse>;
  listMediaAssets: (
    params?: ListMediaAssetsParams,
    options?: ApiRequestOptions,
  ) => Promise<MediaAssetsResponse>;
}

export function createAdminApi(client: ApiClient = apiClient): AdminApi {
  return {
    getDashboard: (options) => client.get<DashboardResponse>("/admin/dashboard", options),
    listUsers: (options) => client.get<AdminUsersResponse>("/admin/users", options),
    moderateSubmission: (submissionId, payload, options) =>
      client.patch<SubmissionResponse>(
        `/admin/submissions/${submissionId}/moderation`,
        payload,
        options,
      ),
    registerMediaAsset: (payload, options) =>
      client.post<MediaAssetResponse>("/admin/media-assets", payload, options),
    listMediaAssets: (params, options) => {
      const mergedOptions: ApiRequestOptions = {
        ...(options ?? {}),
        query: {
          ...(options?.query ?? {}),
          ...(params ?? {}),
        },
      };
      return client.get<MediaAssetsResponse>("/admin/media-assets", mergedOptions);
    },
  };
}
