import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getAdminSessionRole } from "@/lib/adminSession";

export async function GET(request) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value || "";
  const role = getAdminSessionRole(token);
  return NextResponse.json({
    ok: true,
    authenticated: Boolean(role),
    role,
  });
}
