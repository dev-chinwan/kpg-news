import { NextResponse } from "next/server";
import {
  ADMIN_ROLE,
  ADMIN_SESSION_COOKIE,
  SUBADMIN_ROLE,
  getAdminSessionRole,
  getConfiguredSessionRoles,
} from "@/lib/adminSession";

const AUTH_ERROR = "Unauthorized admin request.";

function getBearerToken(value) {
  if (!value) return "";
  const [scheme, token] = value.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return "";
  return String(token || "").trim();
}

export function getExpectedAdminToken() {
  return String(
    process.env.ADMIN_AUTH_SECRET || process.env.ADMIN_SESSION_SECRET || ""
  ).trim();
}

export function getExpectedSubadminToken() {
  return String(process.env.SUBADMIN_AUTH_SECRET || "").trim();
}

export function resolveRoleForToken(token) {
  const value = String(token || "").trim();
  if (!value) return null;

  const adminToken = getExpectedAdminToken();
  if (adminToken && value === adminToken) return ADMIN_ROLE;

  const subadminToken = getExpectedSubadminToken();
  if (subadminToken && value === subadminToken) return SUBADMIN_ROLE;

  return null;
}

function hasRequiredRole(role, minRole) {
  if (!role) return false;
  if (minRole === ADMIN_ROLE) return role === ADMIN_ROLE;
  return role === ADMIN_ROLE || role === SUBADMIN_ROLE;
}

export function getRequestAdminToken(request) {
  const authHeader = request.headers.get("authorization") || "";
  const bearer = getBearerToken(authHeader);
  if (bearer) return bearer;

  const customHeader = request.headers.get("x-admin-token") || "";
  return String(customHeader).trim();
}

export function requireAdminAuth(request, options = {}) {
  const minRole = options?.minRole || SUBADMIN_ROLE;
  const roles = getConfiguredSessionRoles();

  if (minRole === ADMIN_ROLE && !getExpectedAdminToken()) {
    return NextResponse.json(
      {
        ok: false,
        error: "ADMIN_AUTH_SECRET is missing on server.",
      },
      { status: 500 }
    );
  }

  if (roles.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "ADMIN_AUTH_SECRET or SUBADMIN_AUTH_SECRET is missing on server.",
      },
      { status: 500 }
    );
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value || "";
  const sessionRole = getAdminSessionRole(sessionToken);
  if (hasRequiredRole(sessionRole, minRole)) {
    return null;
  }

  const received = getRequestAdminToken(request);
  const tokenRole = resolveRoleForToken(received);
  if (!hasRequiredRole(tokenRole, minRole)) {
    return NextResponse.json({ ok: false, error: AUTH_ERROR }, { status: 401 });
  }

  return null;
}
