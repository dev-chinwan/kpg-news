import Link from "next/link";
import { pick, localizedHref } from "@/lib/i18n";

export default function TrendingNews({ articles, lang }) {
  const fontHi = lang === "hi" ? "font-display-hi" : "font-display";
  const fontBodyHi = lang === "hi" ? "font-body-hi" : "font-body";

  return (
    <aside aria-labelledby="trending-heading">
      <h2
        id="trending-heading"
        className={`${fontHi} text-lg font-bold uppercase tracking-wide text-ink border-b-2 border-ink pb-2 mb-4`}
      >
        ट्रेंडिंग
      </h2>
      <ol className="space-y-4">
        {articles.map((article, i) => (
          <li key={article.id} className="flex gap-3 items-baseline">
            <span
              className="font-mono text-sindoor text-lg font-bold w-6 shrink-0"
              aria-hidden="true"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <Link
              href={localizedHref(`/news/${article.slug}`, lang)}
              className={`text-sm font-semibold text-ink hover:text-sindoor-dark leading-snug ${fontBodyHi}`}
            >
              {pick(article.title, lang)}
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}
