import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import {
  mapAdminUserList,
  mapProfileView,
  mapUserRolesState,
  type ApiAdminUserListResponse,
  type ApiProfileView,
  type ApiUserRolesState,
} from "../mappers";
import type {
  AdminUserList,
  RoleChangePayload,
  UserProfile,
  UserRole,
  UserRolesState,
} from "../types";

const ADMIN_ROOT = "/api/v1/admin";
const USERS_ROOT = `${ADMIN_ROOT}/users`;
const ROLES_ROOT = `${ADMIN_ROOT}/roles`;

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Exclude<UserRole, "user">;
  sort?: "created_at" | "-created_at" | "display_name" | "-display_name";
}

export interface AdminApi {
  listUsers: (params?: ListUsersParams, options?: ApiRequestOptions) => Promise<AdminUserList>;
  getUser: (userId: string, options?: ApiRequestOptions) => Promise<UserProfile>;
  setUserRole: (
    userId: string,
    payload: RoleChangePayload,
    options?: ApiRequestOptions,
  ) => Promise<UserRolesState>;
}

export function createAdminApi(client: ApiClient = apiClient): AdminApi {
  return {
    async listUsers(params, options) {
      const query = {
        ...(params?.page ? { page: params.page } : {}),
        ...(params?.limit ? { limit: params.limit } : {}),
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.role ? { role: params.role } : {}),
        ...(params?.sort ? { sort: params.sort } : {}),
      };

      const response = await client.get<ApiAdminUserListResponse>(USERS_ROOT, {
        ...(options ?? {}),
        query: {
          ...(options?.query ?? {}),
          ...query,
        },
      });

      return mapAdminUserList(response);
    },
    async getUser(userId, options) {
      const response = await client.get<ApiProfileView>(`${USERS_ROOT}/${userId}`, options);
      return mapProfileView(response);
    },
    async setUserRole(userId, payload, options) {
      const response = await client.post<ApiUserRolesState>(
        `${ROLES_ROOT}/${userId}`,
        payload,
        options,
      );
      return mapUserRolesState(response);
    },
  };
}
