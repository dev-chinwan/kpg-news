import Link from "next/link";
import NewsGrid from "./NewsGrid";
import { t, localizedHref } from "@/lib/i18n";

export default function LatestNews({ articles, lang, categories, locations }) {
  const fontHi = lang === "hi" ? "font-display-hi" : "font-display";
  const fontBodyHi = lang === "hi" ? "font-body-hi" : "font-body";

  return (
    <section aria-labelledby="latest-heading">
      <div className="flex items-baseline justify-between border-b-2 border-ink pb-2 mb-4">
        <h2 id="latest-heading" className={`${fontHi} text-lg font-bold uppercase tracking-wide text-ink`}>
          {t("latestNews", lang)}
        </h2>
        <Link
          href={localizedHref("/news", lang)}
          className={`text-xs uppercase tracking-wide text-sindoor hover:underline ${fontBodyHi}`}
        >
          {t("viewAll", lang)}
        </Link>
      </div>
      <NewsGrid
        articles={articles}
        lang={lang}
        categories={categories}
        locations={locations}
        columns={2}
      />
    </section>
  );
}
