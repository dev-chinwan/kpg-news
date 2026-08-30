import { notFound } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import NewsGrid from "@/components/NewsGrid";
import {
  getCategoryById,
  getCategories,
  getLocations,
  getNewsByCategory,
} from "@/lib/news";
import { normalizeLang, pick } from "@/lib/i18n";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.id }));
}

export async function generateMetadata({ params, searchParams }) {
  const { category: categoryId } = await params;
  const sp = await searchParams;
  const lang = normalizeLang(sp?.lang);
  const category = await getCategoryById(categoryId);

  if (!category) return { title: "श्रेणी नहीं मिली" };

  return {
    title: pick(category.name, lang),
    description: `${pick(category.name, lang)} श्रेणी की ताज़ा खबरें`,
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { category: categoryId } = await params;
  const sp = await searchParams;
  const lang = normalizeLang(sp?.lang);

  const category = await getCategoryById(categoryId);
  if (!category) {
    notFound();
  }

  const [articles, categories, locations] = await Promise.all([
    getNewsByCategory(categoryId),
    getCategories(),
    getLocations(),
  ]);

  const fontHi = lang === "hi" ? "font-display-hi" : "font-display";
  const fontBodyHi = lang === "hi" ? "font-body-hi" : "font-body";

  return (
    <SiteShell lang={lang} activeCategory={categoryId}>
      <div className="max-w-content mx-auto px-4 py-8">
        <h1 className={`${fontHi} text-2xl md:text-3xl font-bold text-ink border-b-2 border-sindoor pb-3 mb-6`}>
          {pick(category.name, lang)}
        </h1>

        {articles.length > 0 ? (
          <NewsGrid
            articles={articles}
            lang={lang}
            categories={categories}
            locations={locations}
            columns={3}
          />
        ) : (
          <div className="py-16 text-center">
            <p className={`text-lg font-semibold text-ink mb-2 ${fontBodyHi}`}>
              कोई खबर नहीं मिली
            </p>
            <p className={`text-sm text-slate ${fontBodyHi}`}>कोई और श्रेणी देखें या होमपेज पर जाएं।</p>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
