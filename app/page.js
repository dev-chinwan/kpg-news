import SiteShell from "@/components/SiteShell";
import BreakingNews from "@/components/BreakingNews";
import HeroNews from "@/components/HeroNews";
import LatestNews from "@/components/LatestNews";
import TrendingNews from "@/components/TrendingNews";
import LocationSelector from "@/components/LocationSelector";
import {
  getBreakingNews,
  getFeaturedNews,
  getLatestNews,
  getTrendingNews,
  getCategories,
  getLocations,
  getSite,
} from "@/lib/news";
import { normalizeLang, pick } from "@/lib/i18n";

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const lang = normalizeLang(sp?.lang);
  const site = await getSite();
  return {
    title: `${pick(site.name, lang)} — ${pick(site.tagline, lang)}`,
    description: "स्थानीय, राजनीति, व्यापार, अपराध, शिक्षा, खेल और मौसम से जुड़ी ताज़ा खबरें।",
    alternates: { canonical: "/" },
  };
}

export default async function HomePage({ searchParams }) {
  const sp = await searchParams;
  const lang = normalizeLang(sp?.lang);

  const [breaking, featured, latest, trending, categories, locations] =
    await Promise.all([
      getBreakingNews(),
      getFeaturedNews(),
      getLatestNews(8),
      getTrendingNews(6),
      getCategories(),
      getLocations(),
    ]);

  const hero = featured[0] || latest[0];
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const locMap = Object.fromEntries(locations.map((l) => [l.id, l]));
  const latestWithoutHero = latest.filter((a) => a.id !== hero?.id).slice(0, 6);

  return (
    <SiteShell lang={lang}>
      <BreakingNews articles={breaking} lang={lang} />

      <div className="max-w-content mx-auto px-4">
        <HeroNews
          article={hero}
          lang={lang}
          categoryName={hero ? pick(catMap[hero.category]?.name, lang) : ""}
          locationName={hero ? pick(locMap[hero.location]?.name, lang) : ""}
        />

        <div className="grid lg:grid-cols-[1fr_300px] gap-10 py-6 border-t border-rule">
          <LatestNews
            articles={latestWithoutHero}
            lang={lang}
            categories={categories}
            locations={locations}
          />
          <TrendingNews articles={trending} lang={lang} />
        </div>

        <LocationSelector locations={locations} lang={lang} />
      </div>
    </SiteShell>
  );
}
