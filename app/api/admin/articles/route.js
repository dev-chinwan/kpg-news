import { NextResponse } from "next/server";
import { getStoredArticles, saveArticleToCloudinary } from "@/lib/cloudinaryNews";

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

export async function GET() {
  const articles = await getStoredArticles();
  return NextResponse.json({ articles });
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    const slug = String(formData.get("slug") || "")
      .trim()
      .toLowerCase();
    const titleHi = String(formData.get("titleHi") || "").trim();
    const summaryHi = String(formData.get("summaryHi") || "").trim();
    const contentHiRaw = String(formData.get("contentHi") || "").trim();

    if (!slug || !titleHi || !contentHiRaw) {
      return NextResponse.json(
        {
          ok: false,
          error: "slug, titleHi और contentHi अनिवार्य हैं।",
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

    const article = {
      id: String(formData.get("id") || Date.now()),
      slug,
      category: String(formData.get("category") || "local").trim(),
      location: String(formData.get("location") || "dehradun").trim(),
      title: { hi: titleHi },
      summary: { hi: buildSummary(titleHi, summaryHi, contentHi) },
      content: { hi: contentHi },
      image: existingImage,
      author: String(formData.get("author") || "लोकल न्यूज़ डेस्क").trim(),
      source: String(formData.get("source") || "लोकल न्यूज़").trim(),
      sourceUrl: String(formData.get("sourceUrl") || "").trim(),
      publishedAt:
        String(formData.get("publishedAt") || "").trim() || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featured: parseBoolean(formData.get("featured")),
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
