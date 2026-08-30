import { getCloudinaryClient, isCloudinaryConfigured } from "@/lib/cloudinary";

const ARTICLE_PREFIX = "news-portal/articles/";
const IMAGE_FOLDER = "news-portal/images";

function buildSummaryFromContent(titleHi, summaryHi, contentHi) {
  if (summaryHi && summaryHi.trim()) return summaryHi.trim();

  const firstLine = Array.isArray(contentHi)
    ? contentHi.find((line) => line && line.trim()) || ""
    : "";
  const source = firstLine || titleHi || "विस्तृत खबर देखें।";
  const compact = source.replace(/\s+/g, " ").trim();

  if (compact.length <= 170) return compact;
  return `${compact.slice(0, 167)}...`;
}

function normalizeArticle(article) {
  const now = new Date().toISOString();
  const titleHi = article?.title?.hi || article?.title || "";
  const contentHi = Array.isArray(article?.content?.hi)
    ? article.content.hi
    : Array.isArray(article?.content)
    ? article.content
    : [];
  const summaryHi = buildSummaryFromContent(
    titleHi,
    article?.summary?.hi || "",
    contentHi
  );

  return {
    id: String(article?.id || Date.now()),
    slug: String(article?.slug || ""),
    category: String(article?.category || "local"),
    location: String(article?.location || "dehradun"),
    title: {
      hi: titleHi,
      en: "",
    },
    summary: {
      hi: summaryHi,
      en: "",
    },
    content: {
      hi: contentHi,
      en: [],
    },
    image: article?.image || "",
    author: article?.author || "लोकल न्यूज़ डेस्क",
    source: article?.source || "लोकल न्यूज़",
    sourceUrl: article?.sourceUrl || "",
    publishedAt: article?.publishedAt || now,
    updatedAt: article?.updatedAt || now,
    featured: Boolean(article?.featured),
    breaking: Boolean(article?.breaking),
    trending: Boolean(article?.trending),
    views: Number(article?.views || 0),
    tags: Array.isArray(article?.tags) ? article.tags : [],
  };
}

async function fetchAllRawResources() {
  const cloudinary = getCloudinaryClient();
  const all = [];
  let nextCursor;

  do {
    const page = await cloudinary.api.resources({
      type: "upload",
      resource_type: "raw",
      prefix: ARTICLE_PREFIX,
      max_results: 100,
      next_cursor: nextCursor,
    });

    all.push(...(page.resources || []));
    nextCursor = page.next_cursor;
  } while (nextCursor);

  return all;
}

export async function getStoredArticles() {
  if (!isCloudinaryConfigured()) return [];

  try {
    const resources = await fetchAllRawResources();
    const items = await Promise.all(
      resources.map(async (resource) => {
        try {
          const response = await fetch(resource.secure_url, { cache: "no-store" });
          if (!response.ok) return null;
          const payload = await response.json();
          const article = normalizeArticle(payload);
          if (!article.slug) return null;
          return article;
        } catch {
          return null;
        }
      })
    );

    return items
      .filter(Boolean)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  } catch {
    return [];
  }
}

export async function saveArticleToCloudinary(article, imageFile) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured. Add CLOUDINARY_* variables first.");
  }

  const cloudinary = getCloudinaryClient();
  const normalized = normalizeArticle(article);

  if (!normalized.slug) {
    throw new Error("Slug is required.");
  }

  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const imageResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: IMAGE_FOLDER,
          public_id: `${normalized.slug}-${Date.now()}`,
          resource_type: "image",
          overwrite: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(buffer);
    });

    normalized.image = imageResult.secure_url;
  }

  const rawData = Buffer.from(JSON.stringify(normalized), "utf8").toString("base64");
  await cloudinary.uploader.upload(`data:application/json;base64,${rawData}`, {
    public_id: `${ARTICLE_PREFIX}${normalized.slug}`,
    resource_type: "raw",
    type: "upload",
    overwrite: true,
    invalidate: true,
  });

  return normalized;
}

export async function syncArticlesToCloudinary(articles) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured. Add CLOUDINARY_* variables first.");
  }

  const list = Array.isArray(articles) ? articles : [];
  const slugMap = new Map();

  for (const item of list) {
    const normalized = normalizeArticle(item);
    if (!normalized.slug) continue;
    slugMap.set(normalized.slug, normalized);
  }

  const deduped = Array.from(slugMap.values());
  const saved = [];

  for (const article of deduped) {
    const out = await saveArticleToCloudinary(article, null);
    saved.push(out);
  }

  const cloudinary = getCloudinaryClient();
  const allResources = await fetchAllRawResources();
  const keepIds = new Set(saved.map((a) => `${ARTICLE_PREFIX}${a.slug}`));
  const staleIds = allResources
    .map((resource) => resource.public_id)
    .filter((publicId) => !keepIds.has(publicId));

  if (staleIds.length > 0) {
    await cloudinary.api.delete_resources(staleIds, {
      resource_type: "raw",
      type: "upload",
      invalidate: true,
    });
  }

  return saved.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}
