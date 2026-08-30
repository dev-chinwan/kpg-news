import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import NewsGrid from "@/components/NewsGrid";
import { getAllNews, getCategories, getLocations } from "@/lib/news";
import { normalizeLang, localizedHref } from "@/lib/i18n";

const PAGE_SIZE = 9;

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const lang = normalizeLang(sp?.lang);
  return {
    title: "ताज़ा खबरें",
    description: "सभी ताज़ा और पुरानी खबरें एक ही जगह।",
  };
}

export default async function AllNewsPage({ searchParams }) {
  const sp = await searchParams;
  const lang = normalizeLang(sp?.lang);
  const page = Math.max(1, parseInt(sp?.page, 10) || 1);

  const [all, categories, locations] = await Promise.all([
    getAllNews(),
    getCategories(),
    getLocations(),
  ]);

  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageArticles = all.slice(start, start + PAGE_SIZE);
  const fontHi = lang === "hi" ? "font-display-hi" : "font-display";
  const fontBodyHi = lang === "hi" ? "font-body-hi" : "font-body";

  function pageHref(p) {
    return localizedHref(`/news${p > 1 ? `?page=${p}` : ""}`, lang);
  }

  return (
    <SiteShell lang={lang}>
      <div className="max-w-content mx-auto px-4 py-8">
        <h1 className={`${fontHi} text-2xl md:text-3xl font-bold text-ink border-b-2 border-ink pb-3 mb-6`}>
          {currentPage === 1 ? "ताज़ा खबरें" : "पुरानी खबरें"}
        </h1>

        {pageArticles.length > 0 ? (
          <NewsGrid
            articles={pageArticles}
            lang={lang}
            categories={categories}
            locations={locations}
            columns={3}
          />
        ) : (
          <div className="py-12 text-center">
            <p className={`text-lg font-semibold text-ink ${fontBodyHi}`}>कोई खबर नहीं मिली</p>
          </div>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className={`mt-10 flex items-center justify-center gap-2 ${fontBodyHi}`}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={pageHref(p)}
                aria-current={p === currentPage ? "page" : undefined}
                className={`w-9 h-9 flex items-center justify-center rounded-full text-sm border ${
                  p === currentPage
                    ? "bg-sindoor text-white border-sindoor"
                    : "border-rule text-ink hover:border-sindoor hover:text-sindoor"
                }`}
              >
                {p}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </SiteShell>
  );
}
