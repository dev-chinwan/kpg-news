import { NextResponse } from "next/server";

const buckets = new Map();

function nowMs() {
  return Date.now();
}

function cleanupExpired(windowMs) {
  const cutoff = nowMs() - windowMs;
  for (const [key, value] of buckets.entries()) {
    if (!value || value.updatedAt < cutoff) {
      buckets.delete(key);
    }
  }
}

function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

export function enforceRateLimit(request, options = {}) {
  const {
    limit = 20,
    windowMs = 60 * 1000,
    routeKey = "admin-write",
    message = "Too many requests. Try again shortly.",
  } = options;

  cleanupExpired(windowMs);

  const ip = getClientIp(request);
  const bucketKey = `${routeKey}:${ip}`;
  const current = buckets.get(bucketKey);
  const timestamp = nowMs();

  if (!current || timestamp - current.startedAt > windowMs) {
    buckets.set(bucketKey, {
      count: 1,
      startedAt: timestamp,
      updatedAt: timestamp,
    });
    return null;
  }

  current.count += 1;
  current.updatedAt = timestamp;

  if (current.count > limit) {
    const retryAfterSeconds = Math.ceil(
      (windowMs - (timestamp - current.startedAt)) / 1000
    );

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(retryAfterSeconds, 1)),
        },
      }
    );
  }

  return null;
}
