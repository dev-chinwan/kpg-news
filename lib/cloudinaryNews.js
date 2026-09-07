import { getCloudinaryClient, isCloudinaryConfigured } from "@/lib/cloudinary";

const LEGACY_ARTICLE_PREFIX = "news-portal/articles/";
const ARTICLE_DOC_PREFIX = "news-portal/articles/v1/";
const ARTICLE_INDEX_PREFIX = "news-portal/articles-index/v1";
const SLUG_MAP_PUBLIC_ID = `${ARTICLE_INDEX_PREFIX}/slug-map`;
const LATEST_INDEX_PUBLIC_ID = `${ARTICLE_INDEX_PREFIX}/latest`;
const BY_CATEGORY_PREFIX = `${ARTICLE_INDEX_PREFIX}/by-category`;
const BY_LOCATION_PREFIX = `${ARTICLE_INDEX_PREFIX}/by-location`;
const IMAGE_FOLDER_PREFIX = "news-portal/media/images";
const LEGACY_V1_PREFIX = `${LEGACY_ARTICLE_PREFIX}v1/`;

function buildYearMonth(value) {
  const date = new Date(value || Date.now());
  const year = Number.isNaN(date.getTime()) ? "1970" : String(date.getUTCFullYear());
  const month = Number.isNaN(date.getTime())
    ? "01"
    : String(date.getUTCMonth() + 1).padStart(2, "0");
  return { year, month };
}

function buildArticlePublicId(article) {
  const { year, month } = buildYearMonth(article?.publishedAt);
  return `${ARTICLE_DOC_PREFIX}${year}/${month}/${article.id}`;
}

function buildImageFolder(article) {
  const { year, month } = buildYearMonth(article?.publishedAt);
  return `${IMAGE_FOLDER_PREFIX}/${year}/${month}/${article.id}`;
}

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
  const normalizedId = String(article?.id || `n-${Date.now().toString(36)}`);
  const categoryId = String(article?.categoryId || article?.category || "local");
  const locationId = String(article?.locationId || article?.location || "karanprayag");
  const publishedAt = article?.publishedAt || article?.audit?.publishedAt || now;
  const createdAt = article?.audit?.createdAt || article?.createdAt || publishedAt;
  const updatedAt = article?.updatedAt || article?.audit?.updatedAt || now;
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
    schemaVersion: Number(article?.schemaVersion || 1),
    id: normalizedId,
    slug: String(article?.slug || normalizedId),
    status: String(article?.status || "published"),
    categoryId,
    locationId,
    category: categoryId,
    location: locationId,
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
    media: {
      heroImage: article?.media?.heroImage || null,
      video: article?.media?.video || null,
    },
    seo: {
      metaTitle: article?.seo?.metaTitle || titleHi,
      metaDescription: article?.seo?.metaDescription || summaryHi,
      canonicalUrl: article?.seo?.canonicalUrl || "",
    },
    author: article?.author || "लोकल न्यूज़ डेस्क",
    source: article?.source || "लोकल न्यूज़",
    sourceUrl: article?.sourceUrl || "",
    publishedAt,
    updatedAt,
    featured: Boolean(article?.flags?.featured ?? article?.featured),
    breaking: Boolean(article?.flags?.breaking ?? article?.breaking),
    trending: Boolean(article?.flags?.trending ?? article?.trending),
    views: Number(article?.stats?.views ?? article?.views ?? 0),
    flags: {
      featured: Boolean(article?.flags?.featured ?? article?.featured),
      breaking: Boolean(article?.flags?.breaking ?? article?.breaking),
      trending: Boolean(article?.flags?.trending ?? article?.trending),
    },
    stats: {
      views: Number(article?.stats?.views ?? article?.views ?? 0),
    },
    tags: Array.isArray(article?.tags) ? article.tags : [],
    audit: {
      createdAt,
      updatedAt,
      publishedAt,
      createdBy: article?.audit?.createdBy || "admin",
    },
    isDeleted: Boolean(article?.isDeleted),
  };
}

async function uploadRawJson(publicId, payload) {
  const cloudinary = getCloudinaryClient();
  const rawData = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
  await cloudinary.uploader.upload(`data:application/json;base64,${rawData}`, {
    public_id: publicId,
    resource_type: "raw",
    type: "upload",
    overwrite: true,
    invalidate: true,
  });
}

async function listRawResourcesByPrefix(prefix) {
  const cloudinary = getCloudinaryClient();
  const all = [];
  let nextCursor;

  do {
    const page = await cloudinary.api.resources({
      type: "upload",
      resource_type: "raw",
      prefix,
      max_results: 100,
      next_cursor: nextCursor,
    });

    all.push(...(page.resources || []));
    nextCursor = page.next_cursor;
  } while (nextCursor);

  return all;
}

async function fetchAllRawResources() {
  const [legacy, v1] = await Promise.all([
    listRawResourcesByPrefix(LEGACY_ARTICLE_PREFIX),
    listRawResourcesByPrefix(ARTICLE_DOC_PREFIX),
  ]);

  const merged = [...legacy, ...v1];
  const byId = new Map();
  for (const resource of merged) {
    byId.set(resource.public_id, resource);
  }
  return Array.from(byId.values());
}

async function readArticleFromResource(resource) {
  try {
    const response = await fetch(resource.secure_url, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = await response.json();
    const article = normalizeArticle(payload);
    if (!article.id || article.isDeleted) return null;
    return article;
  } catch {
    return null;
  }
}

function dedupeArticlesByIdentity(articles) {
  const byIdentity = new Map();

  for (const article of articles) {
    const key = String(article?.id || article?.slug || "");
    if (!key) continue;

    const previous = byIdentity.get(key);
    if (!previous) {
      byIdentity.set(key, article);
      continue;
    }

    const prevTs = new Date(previous.updatedAt || previous.publishedAt || 0).getTime();
    const nextTs = new Date(article.updatedAt || article.publishedAt || 0).getTime();
    if (nextTs >= prevTs) {
      byIdentity.set(key, article);
    }
  }

  return Array.from(byIdentity.values());
}

function sortByPublishDesc(articles) {
  return articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

async function writeIndexes(articles) {
  const slugMap = {};
  const byCategory = {};
  const byLocation = {};

  for (const article of articles) {
    if (article.slug) slugMap[article.slug] = article.id;
    slugMap[article.id] = article.id;

    const categoryKey = String(article.categoryId || article.category || "local");
    const locationKey = String(article.locationId || article.location || "dehradun");

    if (!byCategory[categoryKey]) byCategory[categoryKey] = [];
    if (!byLocation[locationKey]) byLocation[locationKey] = [];

    byCategory[categoryKey].push(article);
    byLocation[locationKey].push(article);
  }

  await uploadRawJson(SLUG_MAP_PUBLIC_ID, {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    map: slugMap,
  });

  await uploadRawJson(LATEST_INDEX_PUBLIC_ID, {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    articles,
  });

  const categoryEntries = Object.entries(byCategory);
  for (const [categoryId, list] of categoryEntries) {
    await uploadRawJson(`${BY_CATEGORY_PREFIX}/${categoryId}`, {
      schemaVersion: 1,
      categoryId,
      updatedAt: new Date().toISOString(),
      articles: sortByPublishDesc(list),
    });
  }

  const locationEntries = Object.entries(byLocation);
  for (const [locationId, list] of locationEntries) {
    await uploadRawJson(`${BY_LOCATION_PREFIX}/${locationId}`, {
      schemaVersion: 1,
      locationId,
      updatedAt: new Date().toISOString(),
      articles: sortByPublishDesc(list),
    });
  }
}

function buildRawDocUrls(publicId) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return [];
  return [
    `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}.json`,
    `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}`,
  ];
}

async function readIndexDocument(publicId) {
  const urls = buildRawDocUrls(publicId);
  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) continue;
      return await response.json();
    } catch {
      continue;
    }
  }
  return null;
}

async function rebuildIndexesFromStorage() {
  const resources = await fetchAllRawResources();
  const items = await Promise.all(resources.map((resource) => readArticleFromResource(resource)));
  const deduped = sortByPublishDesc(dedupeArticlesByIdentity(items.filter(Boolean)));
  await writeIndexes(deduped);
  return deduped;
}

function isLegacyArticleResource(publicId) {
  if (!publicId || !publicId.startsWith(LEGACY_ARTICLE_PREFIX)) return false;
  if (publicId.startsWith(LEGACY_V1_PREFIX)) return false;
  return true;
}

function chunkList(items, chunkSize = 100) {
  const out = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    out.push(items.slice(i, i + chunkSize));
  }
  return out;
}

export async function migrateLegacyArticlesToV1(options = {}) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured. Add CLOUDINARY_* variables first.");
  }

  const {
    dryRun = true,
    deleteLegacy = false,
    maxItems = 0,
  } = options;

  const allLegacy = await listRawResourcesByPrefix(LEGACY_ARTICLE_PREFIX);
  const legacyResources = allLegacy.filter((resource) =>
    isLegacyArticleResource(resource.public_id)
  );

  const limit = Number(maxItems) > 0 ? Number(maxItems) : legacyResources.length;
  const selected = legacyResources.slice(0, limit);

  const report = {
    dryRun: Boolean(dryRun),
    deleteLegacy: Boolean(deleteLegacy),
    scannedLegacyCount: legacyResources.length,
    selectedCount: selected.length,
    migratedCount: 0,
    skippedCount: 0,
    deletedLegacyCount: 0,
    migrated: [],
    skipped: [],
  };

  const cloudinary = getCloudinaryClient();
  const deleteCandidates = [];

  for (const resource of selected) {
    const article = await readArticleFromResource(resource);
    if (!article) {
      report.skippedCount += 1;
      report.skipped.push({
        legacyPublicId: resource.public_id,
        reason: "invalid_or_unreadable_article",
      });
      continue;
    }

    const targetPublicId = buildArticlePublicId(article);
    report.migrated.push({
      id: article.id,
      slug: article.slug,
      legacyPublicId: resource.public_id,
      targetPublicId,
    });

    if (!dryRun) {
      await uploadRawJson(targetPublicId, article);
      deleteCandidates.push(resource.public_id);
    }

    report.migratedCount += 1;
  }

  if (!dryRun && report.migratedCount > 0) {
    await rebuildIndexesFromStorage();
  }

  if (!dryRun && deleteLegacy && deleteCandidates.length > 0) {
    const chunks = chunkList(deleteCandidates, 100);
    for (const ids of chunks) {
      await cloudinary.api.delete_resources(ids, {
        resource_type: "raw",
        type: "upload",
        invalidate: true,
      });
      report.deletedLegacyCount += ids.length;
    }
  }

  report.completedAt = new Date().toISOString();
  return report;
}

export async function getStoredArticles() {
  if (!isCloudinaryConfigured()) return [];

  try {
    const latest = await readIndexDocument(LATEST_INDEX_PUBLIC_ID);
    if (Array.isArray(latest?.articles)) {
      return sortByPublishDesc(
        dedupeArticlesByIdentity(latest.articles.map((item) => normalizeArticle(item)))
      );
    }

    const resources = await fetchAllRawResources();
    const items = await Promise.all(resources.map((resource) => readArticleFromResource(resource)));
    const deduped = sortByPublishDesc(dedupeArticlesByIdentity(items.filter(Boolean)));

    if (deduped.length > 0) {
      await writeIndexes(deduped);
    }

    return deduped;
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

  if (!normalized.id) {
    throw new Error("Article id is required.");
  }

  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const imageResult = await new Promise((resolve, reject) => {
      const imageFolder = buildImageFolder(normalized);
      const assetId = `${normalized.slug}-${Date.now()}`;
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: imageFolder,
          public_id: assetId,
          resource_type: "image",
          overwrite: true,
          tags: [
            `article:${normalized.id}`,
            `category:${normalized.categoryId}`,
            `location:${normalized.locationId}`,
          ],
          context: {
            slug: normalized.slug,
            author: normalized.author,
            publishedAt: normalized.publishedAt,
          },
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(buffer);
    });

    normalized.image = imageResult.secure_url;
    normalized.media = {
      ...(normalized.media || {}),
      heroImage: {
        assetId: imageResult.asset_id || "",
        publicId: imageResult.public_id || "",
        secureUrl: imageResult.secure_url || "",
        width: Number(imageResult.width || 0),
        height: Number(imageResult.height || 0),
        format: imageResult.format || "",
        alt: normalized.title?.hi || "",
      },
      video: normalized.media?.video || null,
    };
  }

  normalized.updatedAt = new Date().toISOString();
  normalized.audit = {
    ...(normalized.audit || {}),
    updatedAt: normalized.updatedAt,
    publishedAt: normalized.publishedAt,
    createdAt: normalized.audit?.createdAt || normalized.publishedAt,
    createdBy: normalized.audit?.createdBy || "admin",
  };

  const articlePublicId = buildArticlePublicId(normalized);
  await uploadRawJson(articlePublicId, normalized);
  await rebuildIndexesFromStorage();

  return normalized;
}

export async function syncArticlesToCloudinary(articles) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured. Add CLOUDINARY_* variables first.");
  }

  const list = Array.isArray(articles) ? articles : [];
  const idMap = new Map();

  for (const item of list) {
    const normalized = normalizeArticle(item);
    if (!normalized.id) continue;
    idMap.set(normalized.id, normalized);
  }

  const deduped = Array.from(idMap.values());
  const saved = [];

  for (const article of deduped) {
    const out = await saveArticleToCloudinary(article, null);
    saved.push(out);
  }

  const indexed = await rebuildIndexesFromStorage();
  return indexed.length > 0 ? indexed : sortByPublishDesc(saved);
}

export async function softDeleteArticleById(articleId) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured. Add CLOUDINARY_* variables first.");
  }

  const id = String(articleId || "").trim();
  if (!id) {
    throw new Error("Article id is required.");
  }

  const existing = await getStoredArticles();
  const current = existing.find((item) => String(item.id) === id);
  if (!current) {
    throw new Error("दी गई ID की खबर नहीं मिली।");
  }

  const deletedArticle = normalizeArticle({
    ...current,
    isDeleted: true,
    updatedAt: new Date().toISOString(),
  });

  const articlePublicId = buildArticlePublicId(deletedArticle);
  await uploadRawJson(articlePublicId, deletedArticle);
  await rebuildIndexesFromStorage();

  return deletedArticle;
}
