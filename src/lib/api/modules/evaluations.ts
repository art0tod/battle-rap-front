import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import type { MatchEvaluation, SubmissionEvaluation } from "../types";

export interface SubmissionEvaluationPayload {
  pass?: boolean;
  score?: number;
  comment?: string;
}

export interface MatchEvaluationPayload {
  rubric: Record<string, number>;
  comment?: string;
}

export interface SubmissionEvaluationsResponse {
  evaluations: SubmissionEvaluation[];
}

export interface MatchEvaluationsResponse {
  evaluations: MatchEvaluation[];
}

export interface SubmissionEvaluationResponse {
  evaluation: SubmissionEvaluation;
}

export interface MatchEvaluationResponse {
  evaluation: MatchEvaluation;
}

export interface EvaluationsApi {
  createForSubmission: (
    submissionId: string,
    payload: SubmissionEvaluationPayload,
    options?: ApiRequestOptions,
  ) => Promise<SubmissionEvaluationResponse>;
  createForMatch: (
    matchId: string,
    payload: MatchEvaluationPayload,
    options?: ApiRequestOptions,
  ) => Promise<MatchEvaluationResponse>;
  listForSubmission: (
    submissionId: string,
    options?: ApiRequestOptions,
  ) => Promise<SubmissionEvaluationsResponse>;
  listForMatch: (
    matchId: string,
    options?: ApiRequestOptions,
  ) => Promise<MatchEvaluationsResponse>;
}

export function createEvaluationsApi(client: ApiClient = apiClient): EvaluationsApi {
  return {
    createForSubmission: (submissionId, payload, options) =>
      client.post<SubmissionEvaluationResponse>(
        `/evaluations/submission/${submissionId}`,
        payload,
        options,
      ),
    createForMatch: (matchId, payload, options) =>
      client.post<MatchEvaluationResponse>(`/evaluations/match/${matchId}`, payload, options),
    listForSubmission: (submissionId, options) =>
      client.get<SubmissionEvaluationsResponse>(
        `/evaluations/submission/${submissionId}`,
        options,
      ),
    listForMatch: (matchId, options) =>
      client.get<MatchEvaluationsResponse>(`/evaluations/match/${matchId}`, options),
  };
}
