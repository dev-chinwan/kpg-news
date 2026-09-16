import { NextResponse } from "next/server";
import {
  getStoredArticles,
  saveArticleToCloudinary,
  softDeleteArticleById,
} from "@/lib/cloudinaryNews";
import { requireAdminAuth } from "@/lib/adminAuth";
import { enforceRateLimit } from "@/lib/rateLimit";
import { validateUploadFile } from "@/lib/uploadValidation";

function buildSummary(titleHi, summaryHi, contentHi) {
  if (summaryHi && summaryHi.trim()) return summaryHi.trim();

  const firstLine = contentHi.find((line) => line && line.trim()) || "";
  const source = firstLine || titleHi || "विस्तृत खबर देखें।";
  const compact = source.replace(/\s+/g, " ").trim();

  if (compact.length <= 170) return compact;
  return `${compact.slice(0, 167)}...`;
}

function parseBoolean(value) {
  return value === "true" || value === "on" || value === true;
}

function parseTags(raw) {
  return String(raw || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function generateArticleId() {
  const now = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `n-${now}${rand}`;
}

export async function GET(request) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const articles = await getStoredArticles();
  return NextResponse.json({ articles });
}

export async function POST(request) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const limited = enforceRateLimit(request, {
    routeKey: "admin-articles-post",
    limit: 15,
    windowMs: 60 * 1000,
  });
  if (limited) return limited;

  try {
    const formData = await request.formData();

    const existingId = String(formData.get("id") || "").trim();
    const id = existingId || generateArticleId();
    const titleHi = String(formData.get("titleHi") || "").trim();
    const summaryHi = String(formData.get("summaryHi") || "").trim();
    const contentHiRaw = String(formData.get("contentHi") || "").trim();
    const slug = id;

    if (!titleHi || !summaryHi || !contentHiRaw) {
      return NextResponse.json(
        {
          ok: false,
          error: "titleHi, summaryHi और contentHi अनिवार्य हैं।",
        },
        { status: 400 }
      );
    }

    const contentHi = contentHiRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (contentHi.length === 0) {
      return NextResponse.json(
        { ok: false, error: "कृपया कंटेंट में कम से कम एक पैराग्राफ दें।" },
        { status: 400 }
      );
    }

    const existingImage = String(formData.get("imageUrl") || "").trim();
    const imageFile = formData.get("image");

    if (imageFile instanceof File && imageFile.size > 0) {
      const validation = validateUploadFile(imageFile, "image");
      if (!validation.ok) {
        return NextResponse.json(
          { ok: false, error: validation.error },
          { status: 400 }
        );
      }
    }

    const article = {
      id,
      slug,
      category: String(formData.get("category") || "local").trim(),
      location: String(formData.get("location") || "karanprayag").trim(),
      title: { hi: titleHi },
      summary: { hi: buildSummary(titleHi, summaryHi, contentHi) },
      content: { hi: contentHi },
      image: existingImage,
      author: String(formData.get("author") || "लोकल न्यूज़ डेस्क").trim(),
      source: String(formData.get("source") || "लोकल न्यूज़").trim(),
      publishedAt:
        String(formData.get("publishedAt") || "").trim() || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featured: true,
      breaking: parseBoolean(formData.get("breaking")),
      trending: parseBoolean(formData.get("trending")),
      views: Number(formData.get("views") || 0),
      tags: parseTags(formData.get("tags")),
    };

    const saved = await saveArticleToCloudinary(
      article,
      imageFile instanceof File ? imageFile : null
    );

    return NextResponse.json({ ok: true, article: saved });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "पोस्ट सेव करते समय त्रुटि हुई।",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const limited = enforceRateLimit(request, {
    routeKey: "admin-articles-delete",
    limit: 15,
    windowMs: 60 * 1000,
  });
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);
    const id = String(searchParams.get("id") || "").trim();

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "डिलीट के लिए article id अनिवार्य है।" },
        { status: 400 }
      );
    }

    const deleted = await softDeleteArticleById(id);
    return NextResponse.json({ ok: true, article: deleted });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "खबर डिलीट करते समय त्रुटि हुई।",
      },
      { status: 500 }
    );
  }
}
