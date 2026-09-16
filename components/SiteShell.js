import Header from "./Header";
import Footer from "./Footer";
import { getCategories, getSite } from "@/lib/news";
import { pick, normalizeLang, formatDateTime } from "@/lib/i18n";

// Shared page shell that fetches nav/site data once and renders
// the same Header/Footer everywhere.
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
        siteLogo={site.logo || null}
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
