import { NextResponse } from "next/server";
import { getUiContent, saveUiContent } from "@/lib/uiContent";

export async function GET() {
  const content = await getUiContent();
  return NextResponse.json({ ok: true, content });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const saved = await saveUiContent(body);
    return NextResponse.json({ ok: true, content: saved });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "UI content save नहीं हो सका।" },
      { status: 500 }
    );
  }
}
