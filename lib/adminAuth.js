import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isAdminSessionValid } from "@/lib/adminSession";

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

export function getRequestAdminToken(request) {
  const authHeader = request.headers.get("authorization") || "";
  const bearer = getBearerToken(authHeader);
  if (bearer) return bearer;

  const customHeader = request.headers.get("x-admin-token") || "";
  return String(customHeader).trim();
}

export function requireAdminAuth(request) {
  const expected = getExpectedAdminToken();
  if (!expected) {
    return NextResponse.json(
      {
        ok: false,
        error: "ADMIN_AUTH_SECRET is missing on server.",
      },
      { status: 500 }
    );
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value || "";
  if (isAdminSessionValid(sessionToken)) {
    return null;
  }

  const received = getRequestAdminToken(request);
  if (!received || received !== expected) {
    return NextResponse.json({ ok: false, error: AUTH_ERROR }, { status: 401 });
  }

  return null;
}
