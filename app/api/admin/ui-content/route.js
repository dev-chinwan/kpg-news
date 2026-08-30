import { NextResponse } from "next/server";
import { getUiContent, saveUiContent } from "@/lib/uiContent";
import { getStoredArticles, syncArticlesToCloudinary } from "@/lib/cloudinaryNews";
import newsData from "@/data/news.json";

export async function GET() {
  const content = await getUiContent();
  const cloudinaryArticles = await getStoredArticles();
  const articles = cloudinaryArticles.length > 0 ? cloudinaryArticles : (newsData.articles || []);

  const payload = {
    site: content.site,
    categories: content.categories,
    locations: content.locations,
    articles,
    updatedAt: content.updatedAt || null,
  };

  const source =
    content?._source === "cloudinary" || cloudinaryArticles.length > 0
      ? "cloudinary"
      : "local";

  return NextResponse.json({
    ok: true,
    content: payload,
    source,
    reason: content?._reason || null,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const uiPayload = {
      site: body?.site,
      categories: body?.categories,
      locations: body?.locations,
      updatedAt: new Date().toISOString(),
    };

    const savedUi = await saveUiContent(uiPayload);
    let savedArticles;

    if (Array.isArray(body?.articles)) {
      savedArticles = await syncArticlesToCloudinary(body.articles);
    } else {
      savedArticles = await getStoredArticles();
    }

    return NextResponse.json({
      ok: true,
      content: {
        site: savedUi.site,
        categories: savedUi.categories,
        locations: savedUi.locations,
        articles: savedArticles,
        updatedAt: savedUi.updatedAt,
        _secureUrl: savedUi._secureUrl || null,
      },
      savedArticlesCount: savedArticles.length,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "UI content save नहीं हो सका।" },
      { status: 500 }
    );
  }
}
