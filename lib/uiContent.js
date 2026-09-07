import localNewsData from "@/data/news.json";
import { getCloudinaryClient, isCloudinaryConfigured } from "@/lib/cloudinary";

const UI_CONTENT_ID = "news-portal/config/ui-content";

function buildUiContentUrls() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return [];

  return [
    `https://res.cloudinary.com/${cloudName}/raw/upload/${UI_CONTENT_ID}.json`,
    `https://res.cloudinary.com/${cloudName}/raw/upload/${UI_CONTENT_ID}`,
  ];
}

function buildLocalFallback() {
  return {
    schemaVersion: 1,
    site: localNewsData.site,
    categories: localNewsData.categories,
    locations: localNewsData.locations,
    updatedAt: null,
  };
}

function normalizeUiContent(payload) {
  const local = buildLocalFallback();
  return {
    schemaVersion: Number(payload?.schemaVersion || 1),
    site: payload?.site || local.site,
    categories: Array.isArray(payload?.categories)
      ? payload.categories
      : local.categories,
    locations: Array.isArray(payload?.locations) ? payload.locations : local.locations,
    updatedAt: payload?.updatedAt || new Date().toISOString(),
  };
}

export async function getUiContent() {
  const local = buildLocalFallback();
  if (!isCloudinaryConfigured()) {
    return { ...local, _source: "local", _reason: "cloudinary_not_configured" };
  }

  try {
    const urls = buildUiContentUrls();
    for (const url of urls) {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) continue;

      const payload = await response.json();
      return { ...normalizeUiContent(payload), _source: "cloudinary", _reason: null };
    }

    return { ...local, _source: "local", _reason: "cloudinary_ui_content_not_found" };
  } catch {
    return { ...local, _source: "local", _reason: "cloudinary_read_failed" };
  }
}

export async function saveUiContent(payload) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured. Add CLOUDINARY_* variables first.");
  }

  const cloudinary = getCloudinaryClient();
  const normalized = normalizeUiContent(payload);
  const data = Buffer.from(JSON.stringify(normalized), "utf8").toString("base64");

  const result = await cloudinary.uploader.upload(`data:application/json;base64,${data}`, {
    public_id: UI_CONTENT_ID,
    resource_type: "raw",
    type: "upload",
    overwrite: true,
    invalidate: true,
  });

  return {
    ...normalized,
    _source: "cloudinary",
    _reason: null,
    _secureUrl: result?.secure_url || null,
  };
}
