import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import {
  mapAuthSession,
  mapRefreshTokens,
  type ApiAuthSession,
  type ApiRefreshTokens,
} from "../mappers";
import type { AuthSession, RefreshTokens } from "../types";

const AUTH_ROOT = "/api/v1/auth";

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthApi {
  register: (payload: RegisterPayload, options?: ApiRequestOptions) => Promise<AuthSession>;
  login: (payload: LoginPayload, options?: ApiRequestOptions) => Promise<AuthSession>;
  refresh: (options?: ApiRequestOptions) => Promise<RefreshTokens>;
  logout: (options?: ApiRequestOptions) => Promise<void>;
}

function serializeRegisterPayload(payload: RegisterPayload) {
  return {
    email: payload.email,
    password: payload.password,
    display_name: payload.displayName,
  };
}

function serializeLoginPayload(payload: LoginPayload) {
  return {
    email: payload.email,
    password: payload.password,
  };
}

export function createAuthApi(client: ApiClient = apiClient): AuthApi {
  return {
    async register(payload, options) {
      const response = await client.post<ApiAuthSession>(
        `${AUTH_ROOT}/register`,
        serializeRegisterPayload(payload),
        options,
      );
      return mapAuthSession(response);
    },
    async login(payload, options) {
      const response = await client.post<ApiAuthSession>(
        `${AUTH_ROOT}/login`,
        serializeLoginPayload(payload),
        options,
      );
      return mapAuthSession(response);
    },
    async refresh(options) {
      const response = await client.post<ApiRefreshTokens>(`${AUTH_ROOT}/refresh`, undefined, options);
      return mapRefreshTokens(response);
    },
    async logout(options) {
      await client.post<void>(`${AUTH_ROOT}/logout`, undefined, options);
    },
  };
}
