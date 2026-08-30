// lib/news.js
//
// Data access layer for the news portal.
//
// Every component reads news data through the functions in this file —
// never by importing /data/news.json directly. That is the seam for the
// future migration described in the README: swap the JSON reads below
// for `fetch('/api/...')` calls against a real backend and nothing in
// `app/` or `components/` has to change, because the function
// signatures and shapes stay identical.
//
// All functions are declared `async` on purpose, even though reading a
// local JSON file is synchronous. Callers already `await` them, which
// means the eventual switch to real network calls is a one-file change.

import newsData from "@/data/news.json";
import { getStoredArticles } from "@/lib/cloudinaryNews";
import { getUiContent } from "@/lib/uiContent";

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
  const titleHi = article?.title?.hi || "";
  const contentHi = Array.isArray(article?.content?.hi)
    ? article.content.hi
    : [];
  const summaryHi = buildSummaryFromContent(
    titleHi,
    article?.summary?.hi || "",
    contentHi
  );

  return {
    ...article,
    id: String(article?.id || Date.now()),
    slug: String(article?.slug || ""),
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
    tags: Array.isArray(article?.tags) ? article.tags : [],
    views: Number(article?.views || 0),
    featured: Boolean(article?.featured),
    breaking: Boolean(article?.breaking),
    trending: Boolean(article?.trending),
  };
}

function cloneLocalArticles() {
  return (newsData.articles || []).map((a) => normalizeArticle({ ...a }));
}

async function cloneArticles() {
  const cloudinaryArticles = await getStoredArticles();
  if (cloudinaryArticles.length > 0) {
    return cloudinaryArticles.map((a) => normalizeArticle({ ...a }));
  }

  return cloneLocalArticles();
}

export async function getSite() {
  const content = await getUiContent();
  return {
    ...(content.site || newsData.site),
    defaultLanguage: "hi",
  };
}

export async function getCategories() {
  const content = await getUiContent();
  return content.categories || newsData.categories;
}

export async function getCategoryById(categoryId) {
  const categories = await getCategories();
  return categories.find((c) => c.id === categoryId) || null;
}

export async function getLocations() {
  const content = await getUiContent();
  return content.locations || newsData.locations;
}

export async function getLocationById(locationId) {
  const locations = await getLocations();
  return locations.find((l) => l.id === locationId) || null;
}

export async function getAllNews() {
  const all = await cloneArticles();
  return all.sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  );
}

export async function getLatestNews(limit = 12) {
  const all = await getAllNews();
  return all.slice(0, limit);
}

export async function getFeaturedNews() {
  const all = await getAllNews();
  return all.filter((a) => a.featured);
}

export async function getBreakingNews() {
  const all = await getAllNews();
  return all.filter((a) => a.breaking);
}

export async function getTrendingNews(limit = 6) {
  const all = await cloneArticles();
  return all
    .filter((a) => a.trending)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export async function getNewsByCategory(categoryId) {
  const all = await getAllNews();
  return all.filter((a) => a.category === categoryId);
}

export async function getNewsByLocation(locationId) {
  const all = await getAllNews();
  return all.filter((a) => a.location === locationId);
}

export async function getNewsBySlug(slug) {
  const all = await cloneArticles();
  return all.find((a) => a.slug === slug) || null;
}

export async function searchNews(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];
  const all = await getAllNews();
  return all.filter((a) => {
    const haystack = [
      a.title?.hi,
      a.summary?.hi,
      a.category,
      a.location,
      ...(a.tags || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export async function getRelatedNews(article, limit = 4) {
  if (!article) return [];
  const all = await getAllNews();
  const related = all
    .filter(
      (a) =>
        a.id !== article.id &&
        (a.category === article.category || a.location === article.location)
    )
    .slice(0, limit);

  if (related.length > 0) return related;

  return all.filter((a) => a.id !== article.id).slice(0, limit);
}

export async function getStats() {
  const all = await cloneArticles();
  return {
    total: all.length,
    breaking: all.filter((a) => a.breaking).length,
    featured: all.filter((a) => a.featured).length,
    trending: all.filter((a) => a.trending).length,
  };
}
