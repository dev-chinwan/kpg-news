import localNewsData from "@/data/news.json";
import { getCloudinaryClient, isCloudinaryConfigured } from "@/lib/cloudinary";

const UI_CONTENT_ID = "news-portal/config/ui-content";

function buildLocalFallback() {
  return {
    site: localNewsData.site,
    categories: localNewsData.categories,
    locations: localNewsData.locations,
    updatedAt: null,
  };
}

function normalizeUiContent(payload) {
  const local = buildLocalFallback();
  return {
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
  if (!isCloudinaryConfigured()) return local;

  try {
    const cloudinary = getCloudinaryClient();
    const resource = await cloudinary.api.resource(UI_CONTENT_ID, {
      resource_type: "raw",
      type: "upload",
    });

    if (!resource?.secure_url) return local;

    const response = await fetch(resource.secure_url, { cache: "no-store" });
    if (!response.ok) return local;

    const payload = await response.json();
    return normalizeUiContent(payload);
  } catch {
    return local;
  }
}

export async function saveUiContent(payload) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured. Add CLOUDINARY_* variables first.");
  }

  const cloudinary = getCloudinaryClient();
  const normalized = normalizeUiContent(payload);
  const data = Buffer.from(JSON.stringify(normalized), "utf8").toString("base64");

  await cloudinary.uploader.upload(`data:application/json;base64,${data}`, {
    public_id: UI_CONTENT_ID,
    resource_type: "raw",
    type: "upload",
    overwrite: true,
    invalidate: true,
  });

  return normalized;
}
