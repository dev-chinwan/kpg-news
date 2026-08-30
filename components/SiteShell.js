import Header from "./Header";
import Footer from "./Footer";
import { getCategories, getSite } from "@/lib/news";
import { pick, normalizeLang, formatDateTime } from "@/lib/i18n";

// Next.js App Router layouts don't receive `searchParams`, but our
// language switch relies on a `?lang=` query param that lives on the
// page. So instead of a root layout, every page wraps its content in
// this shared async server component, which fetches the nav data once
// and renders the same Header/Footer everywhere.
export default async function SiteShell({
  lang: rawLang,
  activeCategory,
  activeLocation,
  children,
}) {
  const lang = normalizeLang(rawLang);
  const [categories, site] = await Promise.all([getCategories(), getSite()]);
  const dateLabel = formatDateTime(new Date().toISOString(), lang);

  return (
    <>
      <Header
        lang={lang}
        siteName={pick(site.name, lang)}
        tagline={pick(site.tagline, lang)}
        categories={categories}
        dateLabel={dateLabel}
        activeCategory={activeCategory}
      />
      <main id="main-content" className="min-h-[60vh]">
        {children}
      </main>
      <Footer lang={lang} siteName={pick(site.name, lang)} />
    </>
  );
}
