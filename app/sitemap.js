import { getAllNews, getCategories, getLocations } from "@/lib/news";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap() {
  const [articles, categories, locations] = await Promise.all([
    getAllNews(),
    getCategories(),
    getLocations(),
  ]);

  const staticRoutes = ["", "/news", "/search"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${SITE_URL}/category/${c.id}`,
    lastModified: new Date(),
  }));

  const locationRoutes = locations.map((l) => ({
    url: `${SITE_URL}/location/${l.id}`,
    lastModified: new Date(),
  }));

  const articleRoutes = articles.map((a) => ({
    url: `${SITE_URL}/news/${a.id}`,
    lastModified: a.updatedAt || a.publishedAt,
  }));

  return [...staticRoutes, ...categoryRoutes, ...locationRoutes, ...articleRoutes];
}
