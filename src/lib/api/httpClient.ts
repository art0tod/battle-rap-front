import { apiConfig } from "./config";

type Primitive = string | number | boolean | null | undefined;
type QueryValue = Primitive | Primitive[];

export interface ApiRequestOptions extends Omit<RequestInit, "body" | "headers"> {
  /**
   * Optional query parameters. `undefined` and `null` entries are ignored.
   */
  query?: Record<string, QueryValue>;
  /**
   * Optional request body. Plain objects and arrays are encoded as JSON by default.
   */
  body?: unknown;
  /**
   * Sets the Authorization header to `Bearer <token>`.
   */
  token?: string;
  /**
   * Overrides the base URL for a specific request.
   */
  baseUrl?: string;
  headers?: HeadersInit;
}

export interface ApiClientOptions {
  token?: string;
  baseUrl?: string;
  defaultHeaders?: HeadersInit;
}

interface InternalRequestOptions extends Omit<ApiRequestOptions, "headers" | "body"> {
  baseUrl: string;
  headers: Headers;
  url: string;
  body?: BodyInit | null;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function createTargetUrl(baseUrl: string, path: string): { url: URL; isRelative: boolean } {
  if (isAbsoluteUrl(path)) {
    return { url: new URL(path), isRelative: false };
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (isAbsoluteUrl(baseUrl)) {
    return { url: new URL(`${baseUrl}${normalizedPath}`), isRelative: false };
  }

  const normalizedBase = baseUrl.startsWith("/") ? baseUrl : `/${baseUrl}`;
  const placeholder = new URL(`${normalizedBase}${normalizedPath}`, "http://local-proxy");
  return { url: placeholder, isRelative: true };
}

function isJsonLikeBody(body: unknown): body is Record<string, unknown> | unknown[] {
  if (body === null || body === undefined) {
    return false;
  }
  if (typeof body !== "object") {
    return false;
  }
  if (body instanceof ArrayBuffer) {
    return false;
  }
  if (ArrayBuffer.isView(body)) {
    return false;
  }
  if (body instanceof Blob || body instanceof FormData || body instanceof URLSearchParams) {
    return false;
  }
  if (typeof ReadableStream !== "undefined" && body instanceof ReadableStream) {
    return false;
  }
  return true;
}

function sanitizeHeaders(headers?: HeadersInit): Headers {
  return new Headers(headers ?? {});
}

function resolveBaseUrl(options?: ApiRequestOptions, overrides?: ApiClientOptions): string {
  if (options?.baseUrl) {
    return options.baseUrl.replace(/\/+$/, "");
  }
  if (overrides?.baseUrl) {
    return overrides.baseUrl.replace(/\/+$/, "");
  }
  return apiConfig.apiBaseUrl;
}

function applyQueryParams(url: URL, query?: Record<string, QueryValue>) {
  if (!query) {
    return;
  }
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry === undefined || entry === null) {
          return;
        }
        url.searchParams.append(key, String(entry));
      });
      return;
    }
    url.searchParams.append(key, String(value));
  });
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return null;
  }
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

function prepareRequest(path: string, options: ApiRequestOptions, overrides?: ApiClientOptions): InternalRequestOptions {
  const baseUrl = resolveBaseUrl(options, overrides);
  const { url: target, isRelative } = createTargetUrl(baseUrl, path);
  applyQueryParams(target, options.query);
  const resolvedUrl = isRelative ? `${target.pathname}${target.search}` : target.toString();

  const headers = sanitizeHeaders(options.headers ?? overrides?.defaultHeaders);
  const token = options.token ?? overrides?.token;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const {
    body,
    headers: _headers,
    baseUrl: _baseUrl,
    query: _query,
    token: _token,
    ...rest
  } = options;

  const requestInit: InternalRequestOptions = {
    ...rest,
    baseUrl,
    headers,
    url: resolvedUrl,
  };

  if (body !== undefined && body !== null) {
    if (isJsonLikeBody(body)) {
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      requestInit.body = JSON.stringify(body);
    } else {
      requestInit.body = body as BodyInit;
    }
  }

  return requestInit;
}

async function baseRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
  overrides?: ApiClientOptions,
): Promise<T> {
  const request = prepareRequest(path, options, overrides);
  const { url, baseUrl: _baseUrl, query: _query, token: _token, ...init } = request;

  if (!init.cache) {
    init.cache = "no-store";
  }
  if (!init.credentials) {
    init.credentials = "include";
  }
  if (!init.headers.has("Accept")) {
    init.headers.set("Accept", "application/json");
  }

  const response = await fetch(url, init);
  const payload = await parseResponseBody(response);

  if (!response.ok) {
    const message =
      (typeof payload === "object" &&
        payload !== null &&
        "message" in payload &&
        typeof (payload as { message?: unknown }).message === "string"
        ? (payload as { message: string }).message
        : `Request to ${url} failed with status ${response.status}`);
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

type WithoutBody<T> = Omit<T, "body">;

function withMethod(method: string, options?: ApiRequestOptions): ApiRequestOptions {
  if (options) {
    return { ...options, method };
  }
  return { method };
}

export function request<T>(path: string, options?: ApiRequestOptions): Promise<T> {
  return baseRequest<T>(path, options);
}

export function get<T>(path: string, options?: WithoutBody<ApiRequestOptions>): Promise<T> {
  return baseRequest<T>(path, withMethod("GET", options));
}

export function post<T>(
  path: string,
  body?: unknown,
  options?: WithoutBody<ApiRequestOptions>,
): Promise<T> {
  return baseRequest<T>(path, { ...options, method: "POST", body });
}

export function put<T>(
  path: string,
  body?: unknown,
  options?: WithoutBody<ApiRequestOptions>,
): Promise<T> {
  return baseRequest<T>(path, { ...options, method: "PUT", body });
}

export function patch<T>(
  path: string,
  body?: unknown,
  options?: WithoutBody<ApiRequestOptions>,
): Promise<T> {
  return baseRequest<T>(path, { ...options, method: "PATCH", body });
}

export function del<T>(path: string, options?: WithoutBody<ApiRequestOptions>): Promise<T> {
  return baseRequest<T>(path, withMethod("DELETE", options));
}

export interface ApiClient {
  request: <T>(path: string, options?: ApiRequestOptions) => Promise<T>;
  get: <T>(path: string, options?: WithoutBody<ApiRequestOptions>) => Promise<T>;
  post: <T>(path: string, body?: unknown, options?: WithoutBody<ApiRequestOptions>) => Promise<T>;
  put: <T>(path: string, body?: unknown, options?: WithoutBody<ApiRequestOptions>) => Promise<T>;
  patch: <T>(path: string, body?: unknown, options?: WithoutBody<ApiRequestOptions>) => Promise<T>;
  delete: <T>(path: string, options?: WithoutBody<ApiRequestOptions>) => Promise<T>;
}

export function createApiClient(overrides: ApiClientOptions = {}): ApiClient {
  return {
    request: <T>(path: string, options?: ApiRequestOptions) =>
      baseRequest<T>(path, options, overrides),
    get: <T>(path: string, options?: WithoutBody<ApiRequestOptions>) =>
      baseRequest<T>(path, withMethod("GET", options), overrides),
    post: <T>(path: string, body?: unknown, options?: WithoutBody<ApiRequestOptions>) =>
      baseRequest<T>(path, { ...options, method: "POST", body }, overrides),
    put: <T>(path: string, body?: unknown, options?: WithoutBody<ApiRequestOptions>) =>
      baseRequest<T>(path, { ...options, method: "PUT", body }, overrides),
    patch: <T>(path: string, body?: unknown, options?: WithoutBody<ApiRequestOptions>) =>
      baseRequest<T>(path, { ...options, method: "PATCH", body }, overrides),
    delete: <T>(path: string, options?: WithoutBody<ApiRequestOptions>) =>
      baseRequest<T>(path, withMethod("DELETE", options), overrides),
  };
}

export const apiClient = createApiClient();
