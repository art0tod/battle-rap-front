import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import {
  mapJudgeAssignment,
  mapJudgeBattleDetails,
  type ApiJudgeAssignment,
  type ApiJudgeBattleDetails,
} from "../mappers";
import type {
  JudgeAssignment,
  JudgeAssignmentStatusPayload,
  JudgeBattleDetails,
  JudgeScorePayload,
} from "../types";

const JUDGE_ROOT = "/api/v1/judge";

export interface JudgeApi {
  listAssignments: (options?: ApiRequestOptions) => Promise<JudgeAssignment[]>;
  requestRandomAssignment: (options?: ApiRequestOptions) => Promise<JudgeAssignment | null>;
  updateAssignmentStatus: (
    assignmentId: string,
    payload: JudgeAssignmentStatusPayload,
    options?: ApiRequestOptions,
  ) => Promise<JudgeAssignment>;
  getBattleDetails: (matchId: string, options?: ApiRequestOptions) => Promise<JudgeBattleDetails>;
  submitBattleScore: (
    matchId: string,
    payload: JudgeScorePayload,
    options?: ApiRequestOptions,
  ) => Promise<void>;
}

function ensureClient(client?: ApiClient): ApiClient {
  return client ?? apiClient;
}

export function createJudgeApi(client?: ApiClient): JudgeApi {
  const http = ensureClient(client);
  return {
    async listAssignments(options) {
      const response = await http.get<ApiJudgeAssignment[]>(`${JUDGE_ROOT}/assignments`, options);
      return response.map(mapJudgeAssignment);
    },
    async requestRandomAssignment(options) {
      const response = await http.post<ApiJudgeAssignment | null>(
        `${JUDGE_ROOT}/assignments/random`,
        undefined,
        options,
      );
      if (!response) {
        return null;
      }
      return mapJudgeAssignment(response);
    },
    async updateAssignmentStatus(assignmentId, payload, options) {
      const response = await http.post<ApiJudgeAssignment>(
        `${JUDGE_ROOT}/assignments/${assignmentId}/status`,
        payload,
        options,
      );
      return mapJudgeAssignment(response);
    },
    async getBattleDetails(matchId, options) {
      const response = await http.get<ApiJudgeBattleDetails>(`${JUDGE_ROOT}/battles/${matchId}`, options);
      return mapJudgeBattleDetails(response);
    },
    async submitBattleScore(matchId, payload, options) {
      await http.post(`${JUDGE_ROOT}/battles/${matchId}/scores`, payload, options);
    },
  };
}
