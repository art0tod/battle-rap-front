import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import {
  mapParticipationApplication,
  mapSubmitApplicationResult,
  type ApiParticipationApplication,
  type ApiSubmitApplicationResult,
} from "../mappers";
import type {
  ParticipationApplication,
  SubmitApplicationPayload,
  SubmitApplicationResult,
} from "../types";

const APPLICATIONS_ROOT = "/api/v1/applications";

export interface ArtistApi {
  submitApplication: (
    payload: SubmitApplicationPayload,
    options?: ApiRequestOptions,
  ) => Promise<SubmitApplicationResult>;
  getOwnApplication: (
    options?: ApiRequestOptions,
  ) => Promise<ParticipationApplication | null>;
}

function serializeSubmitApplicationPayload(payload: SubmitApplicationPayload) {
  return {
    city: payload.city ?? undefined,
    age: payload.age ?? undefined,
    vk_id: payload.vkId ?? undefined,
    full_name: payload.fullName ?? undefined,
    beat_author: payload.beatAuthor ?? undefined,
    audio_id: payload.audioId ?? undefined,
    lyrics: payload.lyrics ?? undefined,
  };
}

export function createArtistApi(client: ApiClient = apiClient): ArtistApi {
  return {
    async submitApplication(payload, options) {
      const response = await client.post<ApiSubmitApplicationResult>(
        APPLICATIONS_ROOT,
        serializeSubmitApplicationPayload(payload),
        options,
      );
      return mapSubmitApplicationResult(response);
    },
    async getOwnApplication(options) {
      const response = await client.get<ApiParticipationApplication | null>(
        `${APPLICATIONS_ROOT}/me`,
        options,
      );
      return response ? mapParticipationApplication(response) : null;
    },
  };
}
