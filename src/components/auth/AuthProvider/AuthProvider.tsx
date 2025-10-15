"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import type { ReactNode } from "react";
import {
  battleRapApi,
  type AuthResponse,
  type LoginPayload,
  type RegisterPayload,
  type User,
} from "@/lib/api";
import { ApiError } from "@/lib/api/httpClient";
import {
  clearAuthState,
  readAuthState,
  writeAuthState,
  type StoredAuthState,
} from "@/lib/auth/tokenStorage";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isInitializing: boolean;
  isProcessing: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function resolveApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Не удалось выполнить запрос. Попробуйте снова.";
}

type StoredUserSnapshot = User;

function serializeAuthState(token: string, user: User): StoredAuthState<StoredUserSnapshot> {
  return { token, user };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialAuth] = useState<StoredAuthState<StoredUserSnapshot> | null>(() =>
    readAuthState<StoredUserSnapshot>(),
  );
  const [user, setUser] = useState<User | null>(initialAuth?.user ?? null);
  const [token, setToken] = useState<string | null>(initialAuth?.token ?? null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let isActive = true;

    const storedAuth = initialAuth;
    if (!storedAuth?.token) {
      setIsInitializing(false);
      return () => {
        isActive = false;
      };
    }

    battleRapApi.users
      .getCurrentUser({ token: storedAuth.token })
      .then((response) => {
        if (!isActive) {
          return;
        }
        setUser(response.user);
        writeAuthState(serializeAuthState(storedAuth.token, response.user));
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearAuthState();
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!isActive) {
          return;
        }
        setIsInitializing(false);
      });

    return () => {
      isActive = false;
    };
  }, [initialAuth]);

  const applyAuthResponse = useCallback((response: AuthResponse) => {
    writeAuthState(serializeAuthState(response.token, response.user));
    setToken(response.token);
    setUser(response.user);
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<AuthResponse> => {
    setIsProcessing(true);
    try {
      const response = await battleRapApi.auth.login(payload);
      applyAuthResponse(response);
      return response;
    } catch (error) {
      throw new Error(resolveApiErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  }, [applyAuthResponse]);

  const register = useCallback(async (payload: RegisterPayload): Promise<AuthResponse> => {
    setIsProcessing(true);
    try {
      const response = await battleRapApi.auth.register(payload);
      applyAuthResponse(response);
      return response;
    } catch (error) {
      throw new Error(resolveApiErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  }, [applyAuthResponse]);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const response = await battleRapApi.users.getCurrentUser({ token });
      setUser(response.user);
      writeAuthState(serializeAuthState(token, response.user));
      return response.user;
    } catch (error: unknown) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        clearAuthState();
        setToken(null);
        setUser(null);
        return null;
      }
      return user;
    }
  }, [token]);

  const logout = useCallback(() => {
    clearAuthState();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isInitializing,
      isProcessing,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isInitializing, isProcessing, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
