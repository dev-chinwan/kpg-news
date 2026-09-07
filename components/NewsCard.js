import Link from "next/link";
import ImageWithFallback from "./ImageWithFallback";
import { pick, localizedHref, timeAgo } from "@/lib/i18n";

export default function NewsCard({
  article,
  lang,
  categoryName,
  locationName,
  horizontal = false,
}) {
  const fontHi = lang === "hi" ? "font-display-hi" : "font-display";
  const fontBodyHi = lang === "hi" ? "font-body-hi" : "font-body";

  return (
    <article
      className={`group border-b border-rule pb-5 ${
        horizontal ? "flex gap-4" : ""
      }`}
    >
      <Link
        href={localizedHref(`/news/${article.id}`, lang)}
        className={horizontal ? "shrink-0 w-32 sm:w-40" : "block"}
      >
        <div
          className={`relative overflow-hidden bg-paper-dim ${
            horizontal ? "aspect-square w-32 sm:w-40" : "aspect-[16/10] w-full mb-3"
          }`}
        >
          <ImageWithFallback
            src={article.image}
            alt={pick(article.title, lang)}
            fill
            sizes="(min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="min-w-0 flex-1">
        <div className={`flex items-center gap-2 text-[11px] uppercase tracking-wide text-slate mb-1.5 ${fontBodyHi}`}>
          {categoryName && (
            <span className="text-sindoor font-semibold">{categoryName}</span>
          )}
          {categoryName && locationName && <span aria-hidden="true">•</span>}
          {locationName && <span>{locationName}</span>}
        </div>
        <Link href={localizedHref(`/news/${article.id}`, lang)}>
          <h3
            className={`${fontHi} font-semibold text-ink leading-snug group-hover:text-sindoor-dark transition-colors ${
              horizontal ? "text-base line-clamp-2" : "text-lg line-clamp-2"
            }`}
          >
            {pick(article.title, lang)}
          </h3>
        </Link>
        {!horizontal && (
          <p className={`mt-2 text-sm text-slate line-clamp-2 ${fontBodyHi}`}>
            {pick(article.summary, lang)}
          </p>
        )}
        <div className={`mt-2 text-xs text-slate ${fontBodyHi}`}>
          {timeAgo(article.publishedAt, lang)}
        </div>
      </div>
    </article>
  );
}
