import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import type {
  Round,
  RoundKind,
  RoundScoring,
  Tournament,
  TournamentJudge,
  TournamentParticipant,
  TournamentStatus,
} from "../types";

export interface ListTournamentsResponse {
  tournaments: Tournament[];
}

export interface TournamentResponse {
  tournament: Tournament;
}

export interface TournamentDetailResponse extends TournamentResponse {
  participants: TournamentParticipant[];
  judges: TournamentJudge[];
}

export interface ParticipantsResponse {
  participants: TournamentParticipant[];
}

export interface JudgesResponse {
  judges: TournamentJudge[];
}

export interface RoundsResponse {
  rounds: Round[];
}

export interface ParticipantResponse {
  participant: TournamentParticipant;
}

export interface JudgeResponse {
  judge: TournamentJudge;
}

export interface RoundResponse {
  round: Round;
}

export interface CreateTournamentPayload {
  title: string;
  maxBracketSize: 128 | 256;
}

export interface UpdateTournamentStatusPayload {
  status: TournamentStatus;
}

export interface RegisterParticipantPayload {
  userId: string;
}

export interface AssignJudgePayload {
  userId: string;
}

export interface CreateRoundPayload {
  kind: RoundKind;
  number: number;
  scoring: RoundScoring;
  rubricKeys?: string[];
}

export interface TournamentsApi {
  list: (options?: ApiRequestOptions) => Promise<ListTournamentsResponse>;
  create: (
    payload: CreateTournamentPayload,
    options?: ApiRequestOptions,
  ) => Promise<TournamentResponse>;
  getById: (
    tournamentId: string,
    options?: ApiRequestOptions,
  ) => Promise<TournamentDetailResponse>;
  updateStatus: (
    tournamentId: string,
    payload: UpdateTournamentStatusPayload,
    options?: ApiRequestOptions,
  ) => Promise<TournamentResponse>;
  addParticipant: (
    tournamentId: string,
    payload: RegisterParticipantPayload,
    options?: ApiRequestOptions,
  ) => Promise<ParticipantResponse>;
  listParticipants: (
    tournamentId: string,
    options?: ApiRequestOptions,
  ) => Promise<ParticipantsResponse>;
  addJudge: (
    tournamentId: string,
    payload: AssignJudgePayload,
    options?: ApiRequestOptions,
  ) => Promise<JudgeResponse>;
  listJudges: (
    tournamentId: string,
    options?: ApiRequestOptions,
  ) => Promise<JudgesResponse>;
  createRound: (
    tournamentId: string,
    payload: CreateRoundPayload,
    options?: ApiRequestOptions,
  ) => Promise<RoundResponse>;
  listRounds: (
    tournamentId: string,
    options?: ApiRequestOptions,
  ) => Promise<RoundsResponse>;
}

export function createTournamentsApi(client: ApiClient = apiClient): TournamentsApi {
  return {
    list: (options) => client.get<ListTournamentsResponse>("/tournaments", options),
    create: (payload, options) =>
      client.post<TournamentResponse>("/tournaments", payload, options),
    getById: (tournamentId, options) =>
      client.get<TournamentDetailResponse>(`/tournaments/${tournamentId}`, options),
    updateStatus: (tournamentId, payload, options) =>
      client.patch<TournamentResponse>(`/tournaments/${tournamentId}/status`, payload, options),
    addParticipant: (tournamentId, payload, options) =>
      client.post<ParticipantResponse>(
        `/tournaments/${tournamentId}/participants`,
        payload,
        options,
      ),
    listParticipants: (tournamentId, options) =>
      client.get<ParticipantsResponse>(`/tournaments/${tournamentId}/participants`, options),
    addJudge: (tournamentId, payload, options) =>
      client.post<JudgeResponse>(`/tournaments/${tournamentId}/judges`, payload, options),
    listJudges: (tournamentId, options) =>
      client.get<JudgesResponse>(`/tournaments/${tournamentId}/judges`, options),
    createRound: (tournamentId, payload, options) =>
      client.post<RoundResponse>(`/tournaments/${tournamentId}/rounds`, payload, options),
    listRounds: (tournamentId, options) =>
      client.get<RoundsResponse>(`/tournaments/${tournamentId}/rounds`, options),
  };
}
