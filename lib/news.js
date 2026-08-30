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

function cloneArticles() {
  return newsData.articles.map((a) => ({ ...a }));
}

export async function getSite() {
  return newsData.site;
}

export async function getCategories() {
  return newsData.categories;
}

export async function getCategoryById(categoryId) {
  return newsData.categories.find((c) => c.id === categoryId) || null;
}

export async function getLocations() {
  return newsData.locations;
}

export async function getLocationById(locationId) {
  return newsData.locations.find((l) => l.id === locationId) || null;
}

export async function getAllNews() {
  return cloneArticles().sort(
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
  const all = cloneArticles();
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
  const all = cloneArticles();
  return all.find((a) => a.slug === slug) || null;
}

export async function searchNews(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];
  const all = await getAllNews();
  return all.filter((a) => {
    const haystack = [
      a.title?.en,
      a.title?.hi,
      a.summary?.en,
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
  return all
    .filter(
      (a) =>
        a.id !== article.id &&
        (a.category === article.category || a.location === article.location)
    )
    .slice(0, limit);
}

export async function getStats() {
  const all = cloneArticles();
  return {
    total: all.length,
    breaking: all.filter((a) => a.breaking).length,
    featured: all.filter((a) => a.featured).length,
    trending: all.filter((a) => a.trending).length,
  };
}
