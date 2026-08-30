import Link from "next/link";
import ImageWithFallback from "./ImageWithFallback";
import ShareButtons from "./ShareButtons";
import NewsGrid from "./NewsGrid";
import TrendingNews from "./TrendingNews";
import {
  pick,
  localizedHref,
  formatDateTime,
  timeAgo,
} from "@/lib/i18n";

export default function ArticleView({
  article,
  lang,
  categoryName,
  locationName,
  categories,
  locations,
  relatedArticles = [],
  trendingArticles = [],
  articleUrl,
}) {
  const fontHi = lang === "hi" ? "font-display-hi" : "font-display";
  const fontBodyHi = lang === "hi" ? "font-body-hi" : "font-body";
  const paragraphs = pick(article.content, lang);
  const paragraphList = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
  const summaryText =
    pick(article.summary, lang) || paragraphList.find((p) => p && p.trim()) || "विस्तृत खबर पढ़ें";
  const wordCount = paragraphList.join(" ").split(/\s+/).length;
  const minutes = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className="max-w-content mx-auto px-4 py-6 md:py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className={`text-xs text-slate mb-4 ${fontBodyHi}`}>
        <Link href={localizedHref("/", lang)} className="hover:text-sindoor">
          होम
        </Link>
        <span className="mx-1.5" aria-hidden="true">/</span>
        <Link
          href={localizedHref(`/category/${article.category}`, lang)}
          className="hover:text-sindoor"
        >
          {categoryName}
        </Link>
      </nav>

      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        <article>
          <div className={`flex items-center gap-2 text-xs uppercase tracking-wide mb-3 ${fontBodyHi}`}>
            <span className="text-sindoor font-semibold">{categoryName}</span>
            <span aria-hidden="true">•</span>
            <span className="text-slate">{locationName}</span>
          </div>

          <h1 className={`${fontHi} text-3xl md:text-4xl font-bold leading-tight text-ink`}>
            {pick(article.title, lang)}
          </h1>

          <p className={`mt-4 text-lg text-slate leading-relaxed ${fontBodyHi}`}>
            {summaryText}
          </p>

          <div className={`mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate border-y border-rule py-3 ${fontBodyHi}`}>
            <span>
              लेखक <span className="font-semibold text-ink">{article.author}</span>
            </span>
            <span aria-hidden="true">•</span>
            <span title={formatDateTime(article.publishedAt, lang)}>
              प्रकाशित {timeAgo(article.publishedAt, lang)}
            </span>
            {article.updatedAt && article.updatedAt !== article.publishedAt && (
              <>
                <span aria-hidden="true">•</span>
                <span title={formatDateTime(article.updatedAt, lang)}>
                  अपडेट {timeAgo(article.updatedAt, lang)}
                </span>
              </>
            )}
            <span aria-hidden="true">•</span>
            <span>{minutes} मिनट में पढ़ें</span>
          </div>

          <div className="relative w-full aspect-[16/9] my-6 overflow-hidden bg-paper-dim">
            <ImageWithFallback
              src={article.image}
              alt={pick(article.title, lang)}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
              priority
            />
          </div>

          <div className={`prose-news space-y-4 text-base leading-relaxed text-ink ${fontBodyHi}`}>
            {paragraphList.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className={`text-xs uppercase tracking-wide text-slate font-semibold ${fontBodyHi}`}>
                टैग:
              </span>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-paper-dim text-slate"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-rule">
            <ShareButtons title={pick(article.title, lang)} url={articleUrl} lang={lang} />
          </div>

          {relatedArticles.length > 0 && (
            <section aria-labelledby="related-heading" className="mt-10 pt-6 border-t border-rule">
              <h2
                id="related-heading"
                className={`${fontHi} text-lg font-bold uppercase tracking-wide text-ink mb-4`}
              >
                संबंधित खबरें
              </h2>
              <NewsGrid
                articles={relatedArticles}
                lang={lang}
                categories={categories}
                locations={locations}
                columns={2}
              />
            </section>
          )}
        </article>

        <aside>
          {trendingArticles.length > 0 && (
            <TrendingNews articles={trendingArticles} lang={lang} />
          )}
        </aside>
      </div>
    </div>
  );
}
