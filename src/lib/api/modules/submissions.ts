import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import type { Submission } from "../types";

export interface SubmissionPayload {
  participantId: string;
  audioId: string;
  lyrics?: string;
}

export interface SubmissionResponse {
  submission: Submission;
}

export interface SubmissionsResponse {
  submissions: Submission[];
}

export interface SubmissionsApi {
  saveDraft: (
    roundId: string,
    payload: SubmissionPayload,
    options?: ApiRequestOptions,
  ) => Promise<SubmissionResponse>;
  submit: (
    roundId: string,
    payload: SubmissionPayload,
    options?: ApiRequestOptions,
  ) => Promise<SubmissionResponse>;
  listByRound: (
    roundId: string,
    options?: ApiRequestOptions,
  ) => Promise<SubmissionsResponse>;
}

export function createSubmissionsApi(client: ApiClient = apiClient): SubmissionsApi {
  return {
    saveDraft: (roundId, payload, options) =>
      client.post<SubmissionResponse>(
        `/rounds/${roundId}/submissions/draft`,
        payload,
        options,
      ),
    submit: (roundId, payload, options) =>
      client.post<SubmissionResponse>(
        `/rounds/${roundId}/submissions/submit`,
        payload,
        options,
      ),
    listByRound: (roundId, options) =>
      client.get<SubmissionsResponse>(`/rounds/${roundId}/submissions`, options),
  };
}
