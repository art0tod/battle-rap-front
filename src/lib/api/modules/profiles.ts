import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import { mapProfileView, type ApiProfileView } from "../mappers";
import type { UserProfile } from "../types";

const AUTH_ROOT = "/api/v1/auth";
const PROFILE_ROOT = "/api/v1/profile";

export interface ProfilesApi {
  getAuthenticated: (options?: ApiRequestOptions) => Promise<UserProfile>;
  getSelf: (options?: ApiRequestOptions) => Promise<UserProfile>;
  getById: (profileId: string, options?: ApiRequestOptions) => Promise<UserProfile>;
}

export function createProfilesApi(client: ApiClient = apiClient): ProfilesApi {
  return {
    async getAuthenticated(options) {
      const response = await client.get<ApiProfileView>(`${AUTH_ROOT}/me`, options);
      return mapProfileView(response);
    },
    async getSelf(options) {
      const response = await client.get<ApiProfileView>(`${PROFILE_ROOT}/me`, options);
      return mapProfileView(response);
    },
    async getById(profileId, options) {
      const response = await client.get<ApiProfileView>(`${PROFILE_ROOT}/${profileId}`, options);
      return mapProfileView(response);
    },
  };
}
