const ENV_PROXY_BASE_URL = process.env.NEXT_PUBLIC_INTERNAL_API_BASE_URL;
const ENV_UPSTREAM_API_BASE_URL =
  process.env.BATTLE_RAP_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
const ENV_MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

function normalizeBaseUrl(value: string | undefined, configKey: string, fallback?: string): string {
  const resolved = value ?? fallback;
  if (!resolved) {
    throw new Error(`Environment variable ${configKey} is required but was not provided.`);
  }
  return resolved.replace(/\/+$/, "");
}

export const apiConfig = {
  apiBaseUrl: normalizeBaseUrl(
    ENV_PROXY_BASE_URL,
    "NEXT_PUBLIC_INTERNAL_API_BASE_URL",
    "/api/battle-rap",
  ),
  upstreamApiBaseUrl: normalizeBaseUrl(
    ENV_UPSTREAM_API_BASE_URL,
    "BATTLE_RAP_API_BASE_URL or NEXT_PUBLIC_API_BASE_URL",
  ),
  mediaBaseUrl: normalizeBaseUrl(ENV_MEDIA_BASE_URL, "NEXT_PUBLIC_MEDIA_BASE_URL"),
} as const;

export function buildApiUrl(path: string): string {
  if (!path.startsWith("/")) {
    return `${apiConfig.upstreamApiBaseUrl}/${path}`;
  }
  return `${apiConfig.upstreamApiBaseUrl}${path}`;
}

export function buildMediaUrl(storageKey: string): string {
  if (!storageKey) {
    throw new Error("Cannot build media URL without a storage key.");
  }
  if (/^https?:\/\//i.test(storageKey)) {
    return storageKey;
  }
  const key = storageKey.startsWith("/") ? storageKey.slice(1) : storageKey;
  return `${apiConfig.mediaBaseUrl}/${key}`;
}
