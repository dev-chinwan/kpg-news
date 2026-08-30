import Link from "next/link";
import ImageWithFallback from "./ImageWithFallback";
import { pick, localizedHref, timeAgo, t } from "@/lib/i18n";

export default function HeroNews({ article, lang, locationName, categoryName }) {
  if (!article) return null;
  const fontHi = lang === "hi" ? "font-display-hi" : "font-display";
  const fontBodyHi = lang === "hi" ? "font-body-hi" : "font-body";

  return (
    <section aria-labelledby="hero-heading" className="py-6 md:py-8">
      <p
        className={`text-xs font-bold uppercase tracking-[0.14em] text-sindoor mb-3 ${fontBodyHi}`}
      >
        {t("featuredLabel", lang)}
      </p>
      <Link
        href={localizedHref(`/news/${article.slug}`, lang)}
        className="grid md:grid-cols-2 gap-5 md:gap-8 group"
      >
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-paper-dim">
          <ImageWithFallback
            src={article.image}
            alt={pick(article.title, lang)}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            priority
          />
        </div>
        <div className="flex flex-col justify-center">
          <div className={`flex items-center gap-2 text-xs uppercase tracking-wide text-slate mb-3 ${fontBodyHi}`}>
            <span className="text-sindoor font-semibold">{categoryName}</span>
            <span aria-hidden="true">•</span>
            <span>{locationName}</span>
          </div>
          <h1
            id="hero-heading"
            className={`${fontHi} text-2xl md:text-4xl font-bold leading-tight text-ink group-hover:text-sindoor-dark transition-colors`}
          >
            {pick(article.title, lang)}
          </h1>
          <p className={`mt-4 text-base text-slate leading-relaxed line-clamp-3 ${fontBodyHi}`}>
            {pick(article.summary, lang)}
          </p>
          <div className={`mt-4 text-sm text-slate ${fontBodyHi}`}>
            {locationName} • {timeAgo(article.publishedAt, lang)}
          </div>
        </div>
      </Link>
    </section>
  );
}
