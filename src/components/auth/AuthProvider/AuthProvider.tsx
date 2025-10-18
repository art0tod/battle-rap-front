"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import type { ReactNode } from "react";
import {
  battleRapApi,
  type AuthSession,
  type LoginPayload,
  type RegisterPayload,
  type UserProfile,
} from "@/lib/api";
import { ApiError } from "@/lib/api/httpClient";
import {
  clearAuthState,
  readAuthState,
  writeAuthState,
  type StoredAuthState,
} from "@/lib/auth/tokenStorage";

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isInitializing: boolean;
  isProcessing: boolean;
  login: (payload: LoginPayload) => Promise<UserProfile>;
  register: (payload: RegisterPayload) => Promise<UserProfile>;
  logout: () => void;
  refreshUser: () => Promise<UserProfile | null>;
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

type StoredUserSnapshot = UserProfile;

function serializeAuthState(token: string, user: UserProfile): StoredAuthState<StoredUserSnapshot> {
  return { token, user };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (typeof window === "undefined") {
      return () => {
        isActive = false;
      };
    }

    const storedAuth = readAuthState<StoredUserSnapshot>();
    if (!storedAuth?.token) {
      setIsInitializing(false);
      return () => {
        isActive = false;
      };
    }

    setToken(storedAuth.token);
    setUser(storedAuth.user ?? null);

    battleRapApi.profiles
      .getAuthenticated({ token: storedAuth.token })
      .then((profile) => {
        if (!isActive) {
          return;
        }
        setUser(profile);
        writeAuthState(serializeAuthState(storedAuth.token, profile));
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
  }, []);

  const applyAuthSession = useCallback(
    async (session: AuthSession): Promise<UserProfile> => {
      const profile = await battleRapApi.profiles.getAuthenticated({ token: session.accessToken });
      writeAuthState(serializeAuthState(session.accessToken, profile));
      setToken(session.accessToken);
      setUser(profile);
      return profile;
    },
    [],
  );

  const login = useCallback(
    async (payload: LoginPayload): Promise<UserProfile> => {
      setIsProcessing(true);
      try {
        const session = await battleRapApi.auth.login(payload);
        return await applyAuthSession(session);
      } catch (error) {
        throw new Error(resolveApiErrorMessage(error));
      } finally {
        setIsProcessing(false);
      }
    },
    [applyAuthSession],
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<UserProfile> => {
      setIsProcessing(true);
      try {
        const session = await battleRapApi.auth.register(payload);
        return await applyAuthSession(session);
      } catch (error) {
        throw new Error(resolveApiErrorMessage(error));
      } finally {
        setIsProcessing(false);
      }
    },
    [applyAuthSession],
  );

  const refreshUser = useCallback(async (): Promise<UserProfile | null> => {
    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const profile = await battleRapApi.profiles.getAuthenticated({ token });
      setUser(profile);
      writeAuthState(serializeAuthState(token, profile));
      return profile;
    } catch (error: unknown) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        clearAuthState();
        setToken(null);
        setUser(null);
        return null;
      }
      return user;
    }
  }, [token, user]);

  const logout = useCallback(() => {
    if (token) {
      void battleRapApi.auth.logout({ token }).catch(() => {
        // Swallow logout errors to avoid breaking client-side state reset.
      });
    }
    clearAuthState();
    setToken(null);
    setUser(null);
  }, [token]);

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
