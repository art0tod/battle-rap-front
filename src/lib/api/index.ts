import type { ApiClientOptions } from "./httpClient";
import { apiClient, createApiClient } from "./httpClient";
import type { AuthApi } from "./modules/auth";
import { createAuthApi } from "./modules/auth";
import type { UsersApi } from "./modules/users";
import { createUsersApi } from "./modules/users";
import type { TournamentsApi } from "./modules/tournaments";
import { createTournamentsApi } from "./modules/tournaments";
import type { RoundsApi } from "./modules/rounds";
import { createRoundsApi } from "./modules/rounds";
import type { MatchesApi } from "./modules/matches";
import { createMatchesApi } from "./modules/matches";
import type { SubmissionsApi } from "./modules/submissions";
import { createSubmissionsApi } from "./modules/submissions";
import type { EvaluationsApi } from "./modules/evaluations";
import { createEvaluationsApi } from "./modules/evaluations";
import type { AdminApi } from "./modules/admin";
import { createAdminApi } from "./modules/admin";

export * from "./config";
export * from "./httpClient";
export * from "./types";
export type {
  AuthApi,
  RegisterPayload,
  LoginPayload,
  AuthResponse,
} from "./modules/auth";
export type {
  UsersApi,
  UserResponse,
  ArtistProfileResponse,
  UpdateArtistProfilePayload,
} from "./modules/users";
export type {
  TournamentsApi,
  ListTournamentsResponse,
  TournamentResponse,
  TournamentDetailResponse,
  ParticipantsResponse,
  JudgesResponse,
  RoundsResponse,
  ParticipantResponse,
  JudgeResponse,
  RoundResponse as TournamentRoundResponse,
  CreateTournamentPayload,
  UpdateTournamentStatusPayload,
  RegisterParticipantPayload,
  AssignJudgePayload,
  CreateRoundPayload,
} from "./modules/tournaments";
export type {
  RoundsApi,
  RoundResponse,
  CriteriaResponse,
} from "./modules/rounds";
export type {
  MatchesApi,
  MatchResponse,
  MatchesResponse,
  MatchParticipantResponse,
  MatchParticipantsResponse,
  TracksResponse,
  TrackResponse,
  CreateMatchPayload,
  AddMatchParticipantPayload,
  UploadTrackPayload,
} from "./modules/matches";
export type {
  SubmissionsApi,
  SubmissionPayload,
  SubmissionResponse,
  SubmissionsResponse,
} from "./modules/submissions";
export type {
  EvaluationsApi,
  SubmissionEvaluationPayload,
  MatchEvaluationPayload,
  SubmissionEvaluationsResponse,
  MatchEvaluationsResponse,
  SubmissionEvaluationResponse,
  MatchEvaluationResponse,
} from "./modules/evaluations";
export type {
  AdminApi,
  DashboardResponse,
  AdminUsersResponse,
  ModerateSubmissionPayload,
  SubmissionResponse as AdminSubmissionResponse,
  RegisterMediaAssetPayload,
  MediaAssetResponse,
  MediaAssetsResponse,
  ListMediaAssetsParams,
} from "./modules/admin";

export interface BattleRapApi {
  auth: AuthApi;
  users: UsersApi;
  tournaments: TournamentsApi;
  rounds: RoundsApi;
  matches: MatchesApi;
  submissions: SubmissionsApi;
  evaluations: EvaluationsApi;
  admin: AdminApi;
}

export function createBattleRapApi(options?: ApiClientOptions): BattleRapApi {
  const client = options ? createApiClient(options) : apiClient;
  return {
    auth: createAuthApi(client),
    users: createUsersApi(client),
    tournaments: createTournamentsApi(client),
    rounds: createRoundsApi(client),
    matches: createMatchesApi(client),
    submissions: createSubmissionsApi(client),
    evaluations: createEvaluationsApi(client),
    admin: createAdminApi(client),
  };
}

export const battleRapApi = createBattleRapApi();
