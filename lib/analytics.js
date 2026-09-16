import { getCloudinaryClient, isCloudinaryConfigured } from "@/lib/cloudinary";

const ANALYTICS_PUBLIC_ID = "news-portal/analytics/views-v1";

function buildRawDocUrls(publicId) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return [];
  return [
    `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}.json`,
    `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}`,
  ];
}

function toDayKey(isoDate) {
  return new Date(isoDate).toISOString().slice(0, 10);
}

function buildEmptyAnalytics() {
  return {
    schemaVersion: 1,
    totalViews: 0,
    byDay: {},
    byPost: {},
    updatedAt: null,
  };
}

async function readAnalytics() {
  if (!isCloudinaryConfigured()) {
    return buildEmptyAnalytics();
  }

  const urls = buildRawDocUrls(ANALYTICS_PUBLIC_ID);
  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) continue;

      const payload = await response.json();
      return {
        ...buildEmptyAnalytics(),
        ...payload,
        byDay: payload?.byDay && typeof payload.byDay === "object" ? payload.byDay : {},
        byPost: payload?.byPost && typeof payload.byPost === "object" ? payload.byPost : {},
      };
    } catch {
      continue;
    }
  }

  return buildEmptyAnalytics();
}

async function writeAnalytics(payload) {
  const cloudinary = getCloudinaryClient();
  const rawData = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");

  await cloudinary.uploader.upload(`data:application/json;base64,${rawData}`, {
    public_id: ANALYTICS_PUBLIC_ID,
    resource_type: "raw",
    type: "upload",
    overwrite: true,
    invalidate: true,
  });
}

export async function recordArticleView({ articleId, articleTitle }) {
  const id = String(articleId || "").trim();
  if (!id) return { ok: false, tracked: false };
  if (!isCloudinaryConfigured()) return { ok: true, tracked: false, reason: "cloudinary_not_configured" };

  const nowIso = new Date().toISOString();
  const dayKey = toDayKey(nowIso);

  const analytics = await readAnalytics();
  const currentViews = Number(analytics.totalViews || 0);

  const byDay = { ...(analytics.byDay || {}) };
  byDay[dayKey] = Number(byDay[dayKey] || 0) + 1;

  const byPost = { ...(analytics.byPost || {}) };
  const prevPost = byPost[id] || {};
  byPost[id] = {
    id,
    title: String(articleTitle || prevPost.title || "").trim(),
    views: Number(prevPost.views || 0) + 1,
    lastViewedAt: nowIso,
  };

  const next = {
    schemaVersion: 1,
    totalViews: currentViews + 1,
    byDay,
    byPost,
    updatedAt: nowIso,
  };

  await writeAnalytics(next);
  return { ok: true, tracked: true };
}

export async function getDashboardAnalytics({ days = 7, topPosts = 5 } = {}) {
  const analytics = await readAnalytics();
  const safeDays = Math.max(1, Number(days || 7));
  const safeTop = Math.max(1, Number(topPosts || 5));

  const dayWise = [];
  for (let i = safeDays - 1; i >= 0; i -= 1) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = toDayKey(date.toISOString());
    dayWise.push({
      day: key,
      visits: Number(analytics.byDay?.[key] || 0),
    });
  }

  const top = Object.values(analytics.byPost || {})
    .map((item) => ({
      id: String(item?.id || ""),
      title: String(item?.title || "").trim(),
      views: Number(item?.views || 0),
      lastViewedAt: item?.lastViewedAt || null,
    }))
    .filter((item) => item.id)
    .sort((a, b) => {
      if (b.views !== a.views) return b.views - a.views;
      return new Date(b.lastViewedAt || 0).getTime() - new Date(a.lastViewedAt || 0).getTime();
    })
    .slice(0, safeTop);

  return {
    totalViews: Number(analytics.totalViews || 0),
    dayWise,
    topPosts: top,
    updatedAt: analytics.updatedAt || null,
    source: isCloudinaryConfigured() ? "cloudinary" : "none",
  };
}
