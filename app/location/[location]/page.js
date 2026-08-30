import Link from "next/link";
import { notFound } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import NewsGrid from "@/components/NewsGrid";
import {
  getLocationById,
  getCategories,
  getLocations,
  getNewsByLocation,
} from "@/lib/news";
import { normalizeLang, pick, localizedHref } from "@/lib/i18n";

export async function generateStaticParams() {
  const locations = await getLocations();
  return locations.map((l) => ({ location: l.id }));
}

export async function generateMetadata({ params, searchParams }) {
  const { location: locationId } = await params;
  const sp = await searchParams;
  const lang = normalizeLang(sp?.lang);
  const location = await getLocationById(locationId);

  if (!location) return { title: "शहर नहीं मिला" };

  return {
    title: pick(location.name, lang),
    description: `${pick(location.name, lang)} की ताज़ा खबरें`,
  };
}

export default async function LocationPage({ params, searchParams }) {
  const { location: locationId } = await params;
  const sp = await searchParams;
  const lang = normalizeLang(sp?.lang);
  const activeCat = sp?.cat || null;

  const location = await getLocationById(locationId);
  if (!location) {
    notFound();
  }

  const [articles, categories, locations] = await Promise.all([
    getNewsByLocation(locationId),
    getCategories(),
    getLocations(),
  ]);

  const categoriesInLocation = categories.filter((c) =>
    articles.some((a) => a.category === c.id)
  );
  const filteredArticles = activeCat
    ? articles.filter((a) => a.category === activeCat)
    : articles;

  const fontHi = lang === "hi" ? "font-display-hi" : "font-display";
  const fontBodyHi = lang === "hi" ? "font-body-hi" : "font-body";

  function catHref(catId) {
    const base = `/location/${locationId}`;
    return localizedHref(catId ? `${base}?cat=${catId}` : base, lang);
  }

  return (
    <SiteShell lang={lang} activeLocation={locationId}>
      <div className="max-w-content mx-auto px-4 py-8">
        <h1 className={`${fontHi} text-2xl md:text-3xl font-bold text-ink pb-3 mb-2`}>
          {pick(location.name, lang)}
        </h1>

        {categoriesInLocation.length > 0 && (
          <div className={`flex flex-wrap gap-2 border-b-2 border-sindoor pb-4 mb-6 ${fontBodyHi}`}>
            <Link
              href={catHref(null)}
              aria-current={!activeCat ? "page" : undefined}
              className={`px-3 py-1 rounded-full text-sm border ${
                !activeCat
                  ? "bg-ink text-paper border-ink"
                  : "border-rule text-slate hover:text-ink"
              }`}
            >
              सभी
            </Link>
            {categoriesInLocation.map((c) => (
              <Link
                key={c.id}
                href={catHref(c.id)}
                aria-current={activeCat === c.id ? "page" : undefined}
                className={`px-3 py-1 rounded-full text-sm border ${
                  activeCat === c.id
                    ? "bg-sindoor text-white border-sindoor"
                    : "border-rule text-slate hover:text-ink"
                }`}
              >
                {pick(c.name, lang)}
              </Link>
            ))}
          </div>
        )}

        {filteredArticles.length > 0 ? (
          <NewsGrid
            articles={filteredArticles}
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
            <p className={`text-sm text-slate ${fontBodyHi}`}>कृपया दूसरी श्रेणी चुनें या बाद में दोबारा देखें।</p>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
