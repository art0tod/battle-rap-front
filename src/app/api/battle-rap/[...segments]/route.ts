import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/lib/api/config";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function filterRequestHeaders(headers: Headers): Headers {
  const filtered = new Headers();
  headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lowerKey)) {
      return;
    }
    if (lowerKey === "host" || lowerKey === "content-length" || lowerKey === "origin") {
      return;
    }
    filtered.set(key, value);
  });
  return filtered;
}

function filterResponseHeaders(headers: Headers): Headers {
  const filtered = new Headers();
  headers.forEach((value, key) => {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      return;
    }
    filtered.append(key, value);
  });
  return filtered;
}

function buildUpstreamUrl(pathSegments: string[] | undefined, search: string): string {
  const sanitizedSegments = (pathSegments ?? []).map((segment) => encodeURIComponent(segment));
  const pathname = sanitizedSegments.length ? `/${sanitizedSegments.join("/")}` : "";
  return `${apiConfig.upstreamApiBaseUrl}${pathname}${search}`;
}

type RouteContext = { params: Promise<{ segments?: string[] }> };

async function proxyRequest(request: NextRequest, context: RouteContext): Promise<Response> {
  const params = await context.params;
  const targetUrl = buildUpstreamUrl(params?.segments, request.nextUrl.search);
  const headers = filterRequestHeaders(request.headers);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const bodyBuffer = await request.arrayBuffer();
    if (bodyBuffer.byteLength > 0) {
      init.body = bodyBuffer;
    }
  }

  const upstreamResponse = await fetch(targetUrl, init);
  const responseHeaders = filterResponseHeaders(upstreamResponse.headers);

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}
