import { notFound } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import ArticleView from "@/components/ArticleView";
import {
  getNewsBySlug,
  getAllNews,
  getCategoryById,
  getLocationById,
  getCategories,
  getLocations,
  getRelatedNews,
  getTrendingNews,
} from "@/lib/news";
import { normalizeLang, pick } from "@/lib/i18n";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateStaticParams() {
  const all = await getAllNews();
  return all.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const lang = normalizeLang(sp?.lang);
  const article = await getNewsBySlug(slug);

  if (!article) {
    return { title: "Article not found" };
  }

  const title = pick(article.title, lang);
  const description = pick(article.summary, lang);
  const url = `${SITE_URL}/news/${article.slug}${lang === "hi" ? "?lang=hi" : ""}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      images: article.image ? [{ url: article.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.image ? [article.image] : undefined,
    },
  };
}

export default async function ArticlePage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const lang = normalizeLang(sp?.lang);

  const article = await getNewsBySlug(slug);
  if (!article) {
    notFound();
  }

  const [category, location, categories, locations, related, trending] =
    await Promise.all([
      getCategoryById(article.category),
      getLocationById(article.location),
      getCategories(),
      getLocations(),
      getRelatedNews(article, 4),
      getTrendingNews(5),
    ]);

  const articleUrl = `${SITE_URL}/news/${article.slug}${lang === "hi" ? "?lang=hi" : ""}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: pick(article.title, lang),
    description: pick(article.summary, lang),
    image: article.image ? [article.image] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: [{ "@type": "Person", name: article.author }],
    publisher: { "@type": "Organization", name: "Local News" },
    mainEntityOfPage: articleUrl,
  };

  return (
    <SiteShell lang={lang} activeCategory={article.category}>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ArticleView
        article={article}
        lang={lang}
        categoryName={category ? pick(category.name, lang) : article.category}
        locationName={location ? pick(location.name, lang) : article.location}
        categories={categories}
        locations={locations}
        relatedArticles={related}
        trendingArticles={trending}
        articleUrl={articleUrl}
      />
    </SiteShell>
  );
}
