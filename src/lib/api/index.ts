import type { ApiClientOptions } from "./httpClient";
import { apiClient, createApiClient } from "./httpClient";
import type { AuthApi, LoginPayload, RegisterPayload } from "./modules/auth";
import { createAuthApi } from "./modules/auth";
import type { ProfilesApi } from "./modules/profiles";
import { createProfilesApi } from "./modules/profiles";
import type { MediaApi } from "./modules/media";
import { createMediaApi } from "./modules/media";
import type { ListSubmissionsParams, ModeratorApi } from "./modules/moderator";
import { createModeratorApi } from "./modules/moderator";
import type { AdminApi, ListUsersParams } from "./modules/admin";
import { createAdminApi } from "./modules/admin";
import type {
  AdminBattlesApi,
  CreateAdminBattlePayload,
  ListAdminBattlesParams,
  UpdateAdminBattlePayload,
} from "./modules/adminBattles";
import { createAdminBattlesApi } from "./modules/adminBattles";
import type { JudgeApi } from "./modules/judge";
import { createJudgeApi } from "./modules/judge";
import type {
  ArtistApi,
  ParticipationApplication,
  SubmitApplicationPayload,
  SubmitApplicationResult,
} from "./modules/artist";
import { createArtistApi } from "./modules/artist";
import type {
  ListPublicParticipantsParams,
  PublicParticipantsApi,
} from "./modules/publicParticipants";
import { createPublicParticipantsApi } from "./modules/publicParticipants";
import type { RoundsApi } from "./modules/rounds";
import { createRoundsApi } from "./modules/rounds";
import type { ListPublicBattlesParams, PublicBattlesApi } from "./modules/publicBattles";
import { createPublicBattlesApi } from "./modules/publicBattles";

export * from "./config";
export * from "./httpClient";
export * from "./types";

export type { AuthApi, RegisterPayload, LoginPayload } from "./modules/auth";
export type { ProfilesApi } from "./modules/profiles";
export type { AdminApi, ListUsersParams } from "./modules/admin";
export type {
  AdminBattlesApi,
  ListAdminBattlesParams,
  CreateAdminBattlePayload,
  UpdateAdminBattlePayload,
} from "./modules/adminBattles";
export type { MediaApi } from "./modules/media";
export type { ModeratorApi, ListSubmissionsParams } from "./modules/moderator";
export type { PublicParticipantsApi, ListPublicParticipantsParams } from "./modules/publicParticipants";
export type { PublicBattlesApi, ListPublicBattlesParams } from "./modules/publicBattles";
export type {
  ArtistApi,
  ParticipationApplication,
  SubmitApplicationPayload,
  SubmitApplicationResult,
} from "./modules/artist";
export type { JudgeApi } from "./modules/judge";
export type { RoundsApi } from "./modules/rounds";

export interface BattleRapApi {
  auth: AuthApi;
  profiles: ProfilesApi;
  admin: AdminApi;
  adminBattles: AdminBattlesApi;
  media: MediaApi;
  moderator: ModeratorApi;
  publicParticipants: PublicParticipantsApi;
  publicBattles: PublicBattlesApi;
  artist: ArtistApi;
  judge: JudgeApi;
  rounds: RoundsApi;
}

export function createBattleRapApi(options?: ApiClientOptions): BattleRapApi {
  const client = options ? createApiClient(options) : apiClient;
  return {
    auth: createAuthApi(client),
    profiles: createProfilesApi(client),
    admin: createAdminApi(client),
    adminBattles: createAdminBattlesApi(client),
    media: createMediaApi(client),
    moderator: createModeratorApi(client),
    publicParticipants: createPublicParticipantsApi(client),
    publicBattles: createPublicBattlesApi(client),
    artist: createArtistApi(client),
    judge: createJudgeApi(client),
    rounds: createRoundsApi(client),
  };
}

export const battleRapApi = createBattleRapApi();
