import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import type { Match, MatchParticipant, Track } from "../types";

export interface MatchResponse {
  match: Match;
}

export interface MatchesResponse {
  matches: Match[];
}

export interface MatchParticipantResponse {
  participant: MatchParticipant;
}

export interface MatchParticipantsResponse {
  participants: MatchParticipant[];
}

export interface TracksResponse {
  tracks: Track[];
}

export interface TrackResponse {
  track: Track;
}

export interface CreateMatchPayload {
  startsAt?: string;
}

export interface AddMatchParticipantPayload {
  participantId: string;
  seed?: number;
}

export interface UploadTrackPayload {
  participantId: string;
  audioId: string;
  lyrics?: string;
}

export interface MatchesApi {
  create: (
    roundId: string,
    payload?: CreateMatchPayload,
    options?: ApiRequestOptions,
  ) => Promise<MatchResponse>;
  listByRound: (roundId: string, options?: ApiRequestOptions) => Promise<MatchesResponse>;
  listBattles: (roundId: string, options?: ApiRequestOptions) => Promise<MatchesResponse>;
  getById: (matchId: string, options?: ApiRequestOptions) => Promise<MatchResponse>;
  addParticipant: (
    matchId: string,
    payload: AddMatchParticipantPayload,
    options?: ApiRequestOptions,
  ) => Promise<MatchParticipantResponse>;
  listParticipants: (
    matchId: string,
    options?: ApiRequestOptions,
  ) => Promise<MatchParticipantsResponse>;
  uploadTrack: (
    matchId: string,
    payload: UploadTrackPayload,
    options?: ApiRequestOptions,
  ) => Promise<TrackResponse>;
  listTracks: (matchId: string, options?: ApiRequestOptions) => Promise<TracksResponse>;
}

export function createMatchesApi(client: ApiClient = apiClient): MatchesApi {
  return {
    create: (roundId, payload, options) =>
      client.post<MatchResponse>(`/rounds/${roundId}/matches`, payload, options),
    listByRound: (roundId, options) =>
      client.get<MatchesResponse>(`/rounds/${roundId}/matches`, options),
    listBattles: (roundId, options) =>
      client.get<MatchesResponse>(`/rounds/${roundId}/battles`, options),
    getById: (matchId, options) => client.get<MatchResponse>(`/battles/${matchId}`, options),
    addParticipant: (matchId, payload, options) =>
      client.post<MatchParticipantResponse>(`/matches/${matchId}/participants`, payload, options),
    listParticipants: (matchId, options) =>
      client.get<MatchParticipantsResponse>(`/matches/${matchId}/participants`, options),
    uploadTrack: (matchId, payload, options) =>
      client.post<TrackResponse>(`/matches/${matchId}/tracks`, payload, options),
    listTracks: (matchId, options) =>
      client.get<TracksResponse>(`/matches/${matchId}/tracks`, options),
  };
}
