import SiteShell from "@/components/SiteShell";
import NewsGrid from "@/components/NewsGrid";
import { searchNews, getCategories, getLocations } from "@/lib/news";
import { normalizeLang } from "@/lib/i18n";

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const lang = normalizeLang(sp?.lang);
  const q = sp?.q || "";
  return {
    title: q ? `इसके लिए खोज परिणाम: ${q}` : "खोज",
  };
}

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const lang = normalizeLang(sp?.lang);
  const query = (sp?.q || "").toString();

  const [results, categories, locations] = await Promise.all([
    searchNews(query),
    getCategories(),
    getLocations(),
  ]);

  const fontHi = lang === "hi" ? "font-display-hi" : "font-display";
  const fontBodyHi = lang === "hi" ? "font-body-hi" : "font-body";

  return (
    <SiteShell lang={lang}>
      <div className="max-w-content mx-auto px-4 py-8">
        {query ? (
          <h1 className={`${fontHi} text-xl md:text-2xl font-bold text-ink border-b-2 border-ink pb-3 mb-6`}>
            इसके लिए खोज परिणाम{" "}
            <span className="text-sindoor">&ldquo;{query}&rdquo;</span>
          </h1>
        ) : (
          <h1 className={`${fontHi} text-xl md:text-2xl font-bold text-ink border-b-2 border-ink pb-3 mb-6`}>
            खोज
          </h1>
        )}

        {query && results.length === 0 && (
          <div className="py-16 text-center">
            <p className={`text-lg font-semibold text-ink mb-2 ${fontBodyHi}`}>
              कोई खबर नहीं मिली
            </p>
            <p className={`text-sm text-slate ${fontBodyHi}`}>दूसरा शब्द खोजें या होमपेज की खबरें देखें।</p>
          </div>
        )}

        {results.length > 0 && (
          <NewsGrid
            articles={results}
            lang={lang}
            categories={categories}
            locations={locations}
            columns={3}
          />
        )}
      </div>
    </SiteShell>
  );
}
