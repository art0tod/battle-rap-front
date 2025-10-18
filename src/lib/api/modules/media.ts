import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import {
  mapMediaAssetStatus,
  mapPresignResponse,
  type ApiMediaAssetStatus,
  type ApiPresignResponse,
} from "../mappers";
import type {
  CompleteUploadPayload,
  MediaAssetStatus,
  PresignUploadPayload,
  PresignUploadResponse,
} from "../types";

const MEDIA_ROOT = "/api/v1/media";

export interface MediaApi {
  presignUpload: (
    payload: PresignUploadPayload,
    options?: ApiRequestOptions,
  ) => Promise<PresignUploadResponse>;
  completeUpload: (
    payload: CompleteUploadPayload,
    options?: ApiRequestOptions,
  ) => Promise<MediaAssetStatus>;
}

function serializePresignPayload(payload: PresignUploadPayload) {
  return {
    filename: payload.filename,
    mime: payload.mime,
    size_bytes: payload.sizeBytes,
    type: payload.type,
  };
}

function serializeCompletePayload(payload: CompleteUploadPayload) {
  return {
    asset_id: payload.assetId,
    storage_key: payload.storageKey,
    mime: payload.mime,
    size_bytes: payload.sizeBytes,
    kind: payload.kind,
  };
}

export function createMediaApi(client: ApiClient = apiClient): MediaApi {
  return {
    async presignUpload(payload, options) {
      const response = await client.post<ApiPresignResponse>(
        `${MEDIA_ROOT}/presign`,
        serializePresignPayload(payload),
        options,
      );
      return mapPresignResponse(response);
    },
    async completeUpload(payload, options) {
      const response = await client.post<ApiMediaAssetStatus>(
        `${MEDIA_ROOT}/complete`,
        serializeCompletePayload(payload),
        options,
      );
      return mapMediaAssetStatus(response);
    },
  };
}
