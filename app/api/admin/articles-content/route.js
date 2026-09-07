import { NextResponse } from "next/server";
import newsData from "@/data/news.json";
import { requireAdminAuth } from "@/lib/adminAuth";
import { enforceRateLimit } from "@/lib/rateLimit";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { getStoredArticles, syncArticlesToCloudinary } from "@/lib/cloudinaryNews";

function normalizeIncomingArticle(raw, index) {
  const contentHi = Array.isArray(raw?.content?.hi)
    ? raw.content.hi
    : Array.isArray(raw?.content)
    ? raw.content
    : String(raw?.contentHi || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

  return {
    ...raw,
    id: String(raw?.id || "").trim() || `bulk-${Date.now().toString(36)}-${index}`,
    slug: String(raw?.slug || raw?.id || "").trim() || undefined,
    title: {
      hi: String(raw?.title?.hi || raw?.titleHi || raw?.title || "").trim(),
      en: String(raw?.title?.en || "").trim(),
    },
    summary: {
      hi: String(raw?.summary?.hi || raw?.summaryHi || raw?.summary || "").trim(),
      en: String(raw?.summary?.en || "").trim(),
    },
    content: {
      hi: contentHi,
      en: Array.isArray(raw?.content?.en) ? raw.content.en : [],
    },
  };
}

function buildLocalPayload() {
  const localArticles = Array.isArray(newsData?.articles) ? newsData.articles : [];
  return {
    schemaVersion: 1,
    articles: localArticles,
    updatedAt: null,
  };
}

export async function GET(request) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const localPayload = buildLocalPayload();

  if (!isCloudinaryConfigured()) {
    return NextResponse.json({
      ok: true,
      content: localPayload,
      source: "local",
      reason: "cloudinary_not_configured",
    });
  }

  const articles = await getStoredArticles();
  if (articles.length === 0) {
    return NextResponse.json({
      ok: true,
      content: localPayload,
      source: "local",
      reason: "cloudinary_articles_not_found",
    });
  }

  return NextResponse.json({
    ok: true,
    content: {
      schemaVersion: 1,
      articles,
      updatedAt: new Date().toISOString(),
    },
    source: "cloudinary",
    reason: null,
  });
}

export async function POST(request) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const limited = enforceRateLimit(request, {
    routeKey: "admin-articles-content-post",
    limit: 5,
    windowMs: 60 * 1000,
  });
  if (limited) return limited;

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Cloudinary is not configured. Add CLOUDINARY_* variables first.",
      },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const inputArticles = Array.isArray(body)
      ? body
      : Array.isArray(body?.articles)
      ? body.articles
      : null;

    if (!inputArticles) {
      return NextResponse.json(
        {
          ok: false,
          error: "Body must be an array or an object with an articles array.",
        },
        { status: 400 }
      );
    }

    const normalized = inputArticles.map((item, index) => normalizeIncomingArticle(item, index));
    const invalid = normalized.find(
      (item) => !item?.title?.hi || !Array.isArray(item?.content?.hi) || item.content.hi.length === 0
    );

    if (invalid) {
      return NextResponse.json(
        {
          ok: false,
          error: "हर article में title.hi और content.hi (कम से कम 1 पैराग्राफ) होना जरूरी है।",
        },
        { status: 400 }
      );
    }

    const synced = await syncArticlesToCloudinary(normalized);

    return NextResponse.json({
      ok: true,
      content: {
        schemaVersion: 1,
        articles: synced,
        updatedAt: new Date().toISOString(),
      },
      source: "cloudinary",
      reason: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Articles content save नहीं हो सका।",
      },
      { status: 500 }
    );
  }
}
