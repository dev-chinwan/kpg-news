import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rateLimit";
import { recordArticleView } from "@/lib/analytics";

export async function POST(request) {
  const limited = enforceRateLimit(request, {
    routeKey: "analytics-view-post",
    limit: 80,
    windowMs: 60 * 1000,
    message: "Too many view events. Please try again shortly.",
  });
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => ({}));
    const articleId = String(body?.articleId || "").trim();
    const articleTitle = String(body?.articleTitle || "").trim();

    if (!articleId) {
      return NextResponse.json({ ok: false, error: "articleId is required." }, { status: 400 });
    }

    const result = await recordArticleView({ articleId, articleTitle });
    return NextResponse.json({ ok: true, tracked: Boolean(result?.tracked) });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Unable to track view." },
      { status: 500 }
    );
  }
}
