import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_CONTEXT = "news-portal-admin-session-v1";

function toBuffer(value) {
  return Buffer.from(String(value || ""), "utf8");
}

function getSecret() {
  return String(
    process.env.ADMIN_AUTH_SECRET || process.env.ADMIN_SESSION_SECRET || ""
  ).trim();
}

export function buildAdminSessionToken() {
  const secret = getSecret();
  if (!secret) return "";

  return createHmac("sha256", secret).update(SESSION_CONTEXT).digest("base64url");
}

export function isAdminSessionValid(token) {
  const expected = buildAdminSessionToken();
  const received = String(token || "");
  if (!expected || !received) return false;

  const expectedBuffer = toBuffer(expected);
  const receivedBuffer = toBuffer(received);
  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  };
}
