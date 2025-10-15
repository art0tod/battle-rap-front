import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import type { ArtistProfile, User, UserRole } from "../types";

export interface UpdateArtistProfilePayload {
  avatarKey?: string | null;
  bio?: string | null;
  socials?: Record<string, string>;
}

export interface UserResponse {
  user: User;
}

export interface ArtistProfileResponse {
  profile: ArtistProfile | null;
}

export interface UsersApi {
  getCurrentUser: (options?: ApiRequestOptions) => Promise<UserResponse>;
  getUserById: (userId: string, options?: ApiRequestOptions) => Promise<UserResponse>;
  addRoles: (userId: string, roles: UserRole[], options?: ApiRequestOptions) => Promise<UserResponse>;
  replaceRoles: (userId: string, roles: UserRole[], options?: ApiRequestOptions) => Promise<UserResponse>;
  getArtistProfile: (
    userId: string,
    options?: ApiRequestOptions,
  ) => Promise<ArtistProfileResponse>;
  updateArtistProfile: (
    userId: string,
    payload: UpdateArtistProfilePayload,
    options?: ApiRequestOptions,
  ) => Promise<ArtistProfileResponse>;
}

export function createUsersApi(client: ApiClient = apiClient): UsersApi {
  return {
    getCurrentUser: (options) => client.get<UserResponse>("/users/me", options),
    getUserById: (userId, options) => client.get<UserResponse>(`/users/${userId}`, options),
    addRoles: (userId, roles, options) =>
      client.post<UserResponse>(`/users/${userId}/roles`, { roles }, options),
    replaceRoles: (userId, roles, options) =>
      client.put<UserResponse>(`/users/${userId}/roles`, { roles }, options),
    getArtistProfile: (userId, options) =>
      client.get<ArtistProfileResponse>(`/users/${userId}/artist-profile`, options),
    updateArtistProfile: (userId, payload, options) =>
      client.put<ArtistProfileResponse>(`/users/${userId}/artist-profile`, payload, options),
  };
}
