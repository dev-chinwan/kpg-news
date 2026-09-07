import { NextResponse } from "next/server";
import { getUiContent, saveUiContent } from "@/lib/uiContent";
import { getStoredArticles } from "@/lib/cloudinaryNews";
import newsData from "@/data/news.json";
import { requireAdminAuth } from "@/lib/adminAuth";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function GET(request) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const content = await getUiContent();
  const cloudinaryArticles = await getStoredArticles();
  const articles = cloudinaryArticles.length > 0 ? cloudinaryArticles : (newsData.articles || []);

  const payload = {
    site: content.site,
    categories: content.categories,
    locations: content.locations,
    updatedAt: content.updatedAt || null,
  };

  const source =
    content?._source === "cloudinary" || cloudinaryArticles.length > 0
      ? "cloudinary"
      : "local";

  return NextResponse.json({
    ok: true,
    content: payload,
    articles,
    source,
    reason: content?._reason || null,
  });
}

export async function POST(request) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const limited = enforceRateLimit(request, {
    routeKey: "admin-ui-content-post",
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (limited) return limited;

  try {
    const body = await request.json();
    const uiPayload = {
      schemaVersion: Number(body?.schemaVersion || 1),
      site: body?.site,
      categories: body?.categories,
      locations: body?.locations,
      updatedAt: new Date().toISOString(),
    };

    const savedUi = await saveUiContent(uiPayload);
    const savedArticles = await getStoredArticles();

    return NextResponse.json({
      ok: true,
      content: {
        site: savedUi.site,
        categories: savedUi.categories,
        locations: savedUi.locations,
        updatedAt: savedUi.updatedAt,
        _secureUrl: savedUi._secureUrl || null,
      },
      articlesCount: savedArticles.length,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "UI content save नहीं हो सका।" },
      { status: 500 }
    );
  }
}
