const STORAGE_KEY = "battle-rap-auth";

export interface StoredAuthState<TUser = Record<string, unknown>> {
  token: string;
  user?: TUser;
}

function getPreferredStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    // Ignore and try localStorage.
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readAuthState<TUser = Record<string, unknown>>(): StoredAuthState<TUser> | null {
  const storage = getPreferredStorage();
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredAuthState<TUser>;
    if (!parsed || typeof parsed !== "object" || typeof parsed.token !== "string") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeAuthState<TUser = Record<string, unknown>>(state: StoredAuthState<TUser>): void {
  const storage = getPreferredStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Swallow storage errors (e.g., Safari private mode).
  }
}

export function clearAuthState(): void {
  const storage = getPreferredStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors during cleanup.
  }
}
