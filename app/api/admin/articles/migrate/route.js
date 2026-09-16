import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";

export async function POST(request) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  return NextResponse.json(
    {
      ok: false,
      error: "Legacy migration endpoint has been removed.",
    },
    { status: 410 }
  );
}
