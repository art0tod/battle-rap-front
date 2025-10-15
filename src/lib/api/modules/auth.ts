import type { ApiClient, ApiRequestOptions } from "../httpClient";
import { apiClient } from "../httpClient";
import type { User, UserRole } from "../types";

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  roles?: UserRole[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthApi {
  register: (payload: RegisterPayload, options?: ApiRequestOptions) => Promise<AuthResponse>;
  login: (payload: LoginPayload, options?: ApiRequestOptions) => Promise<AuthResponse>;
}

export function createAuthApi(client: ApiClient = apiClient): AuthApi {
  return {
    register: (payload, options) =>
      client.post<AuthResponse>("/auth/register", payload, options),
    login: (payload, options) => client.post<AuthResponse>("/auth/login", payload, options),
  };
}
