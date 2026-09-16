import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rateLimit";
import {
  ADMIN_SESSION_COOKIE,
  buildAdminSessionToken,
  getAdminSessionCookieOptions,
} from "@/lib/adminSession";
import { resolveRoleForToken } from "@/lib/adminAuth";

export async function POST(request) {
  const limited = enforceRateLimit(request, {
    routeKey: "admin-login-post",
    limit: 20,
    windowMs: 60 * 1000,
    message: "Too many login attempts. Please try again shortly.",
  });
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => ({}));
    const token = String(body?.token || "").trim();
    const role = resolveRoleForToken(token);
    if (!role) {
      return NextResponse.json(
        { ok: false, error: "Invalid admin token." },
        { status: 401 }
      );
    }

    const sessionToken = buildAdminSessionToken(role);
    const response = NextResponse.json({ ok: true, role });
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      sessionToken,
      getAdminSessionCookieOptions()
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Login failed." },
      { status: 500 }
    );
  }
}
