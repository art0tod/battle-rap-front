const ENV_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ENV_MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

function normalizeBaseUrl(value: string | undefined, envKey: string): string {
  if (!value) {
    throw new Error(`Environment variable ${envKey} is required but was not provided.`);
  }
  return value.replace(/\/+$/, "");
}

export const apiConfig = {
  apiBaseUrl: normalizeBaseUrl(ENV_API_BASE_URL, "NEXT_PUBLIC_API_BASE_URL"),
  mediaBaseUrl: normalizeBaseUrl(ENV_MEDIA_BASE_URL, "NEXT_PUBLIC_MEDIA_BASE_URL"),
} as const;

export function buildApiUrl(path: string): string {
  if (!path.startsWith("/")) {
    return `${apiConfig.apiBaseUrl}/${path}`;
  }
  return `${apiConfig.apiBaseUrl}${path}`;
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
