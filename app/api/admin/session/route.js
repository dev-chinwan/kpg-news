import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isAdminSessionValid } from "@/lib/adminSession";

export async function GET(request) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value || "";
  return NextResponse.json({
    ok: true,
    authenticated: isAdminSessionValid(token),
  });
}
