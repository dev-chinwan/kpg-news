import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_CONTEXT = "news-portal-admin-session-v1";
export const ADMIN_ROLE = "admin";
export const SUBADMIN_ROLE = "subadmin";

function toBuffer(value) {
  return Buffer.from(String(value || ""), "utf8");
}

function getAdminSecret() {
  return String(
    process.env.ADMIN_AUTH_SECRET || process.env.ADMIN_SESSION_SECRET || ""
  ).trim();
}

function getSubadminSecret() {
  return String(process.env.SUBADMIN_AUTH_SECRET || "").trim();
}

function getSecretForRole(role) {
  if (role === ADMIN_ROLE) return getAdminSecret();
  if (role === SUBADMIN_ROLE) return getSubadminSecret();
  return "";
}

export function getConfiguredSessionRoles() {
  const roles = [];
  if (getAdminSecret()) roles.push(ADMIN_ROLE);
  if (getSubadminSecret()) roles.push(SUBADMIN_ROLE);
  return roles;
}

function buildSessionSignature(role, secret) {
  return createHmac("sha256", secret)
    .update(`${SESSION_CONTEXT}:${role}`)
    .digest("base64url");
}

export function buildAdminSessionToken(role = SUBADMIN_ROLE) {
  const secret = getSecretForRole(role);
  if (!secret) return "";

  return `${role}.${buildSessionSignature(role, secret)}`;
}

function parseSessionToken(token) {
  const raw = String(token || "").trim();
  const dotAt = raw.indexOf(".");
  if (!raw || dotAt <= 0 || dotAt >= raw.length - 1) {
    return { role: "", signature: "" };
  }

  return {
    role: raw.slice(0, dotAt),
    signature: raw.slice(dotAt + 1),
  };
}

export function getAdminSessionRole(token) {
  const { role, signature } = parseSessionToken(token);
  const secret = getSecretForRole(role);
  if (!role || !signature || !secret) return null;

  const expectedSignature = buildSessionSignature(role, secret);
  const expectedBuffer = toBuffer(expectedSignature);
  const receivedBuffer = toBuffer(signature);
  if (expectedBuffer.length !== receivedBuffer.length) return null;

  return timingSafeEqual(expectedBuffer, receivedBuffer) ? role : null;
}

export function isAdminSessionValid(token) {
  return Boolean(getAdminSessionRole(token));
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
