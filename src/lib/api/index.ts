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

export * from "./config";
export * from "./httpClient";
export * from "./types";

export type { AuthApi, RegisterPayload, LoginPayload } from "./modules/auth";
export type { ProfilesApi } from "./modules/profiles";
export type { AdminApi, ListUsersParams } from "./modules/admin";
export type { MediaApi } from "./modules/media";
export type { ModeratorApi, ListSubmissionsParams } from "./modules/moderator";
export type { PublicParticipantsApi, ListPublicParticipantsParams } from "./modules/publicParticipants";
export type {
  ArtistApi,
  ParticipationApplication,
  SubmitApplicationPayload,
  SubmitApplicationResult,
} from "./modules/artist";

export interface BattleRapApi {
  auth: AuthApi;
  profiles: ProfilesApi;
  admin: AdminApi;
  media: MediaApi;
  moderator: ModeratorApi;
  publicParticipants: PublicParticipantsApi;
  artist: ArtistApi;
}

export function createBattleRapApi(options?: ApiClientOptions): BattleRapApi {
  const client = options ? createApiClient(options) : apiClient;
  return {
    auth: createAuthApi(client),
    profiles: createProfilesApi(client),
    admin: createAdminApi(client),
    media: createMediaApi(client),
    moderator: createModeratorApi(client),
    publicParticipants: createPublicParticipantsApi(client),
    artist: createArtistApi(client),
  };
}

export const battleRapApi = createBattleRapApi();
