import Link from "next/link";
import { pick, localizedHref, t } from "@/lib/i18n";

export default function BreakingNews({ articles, lang }) {
  if (!articles || articles.length === 0) return null;

  // Duplicate the list so the CSS marquee (-50%) loops seamlessly.
  const loopItems = [...articles, ...articles];

  return (
    <div className="bg-sindoor text-white overflow-hidden">
      <div className="max-w-content mx-auto flex items-stretch">
        <span
          className={`shrink-0 flex items-center gap-1.5 bg-sindoor-dark px-3 py-2 text-xs font-bold uppercase tracking-wider ${
            lang === "hi" ? "font-body-hi" : "font-body"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          {t("breakingLabel", lang)}
        </span>
        <div className="relative flex-1 overflow-hidden py-2">
          <div className="ticker-track flex gap-10 w-max whitespace-nowrap">
            {loopItems.map((a, i) => (
              <Link
                key={`${a.id}-${i}`}
                href={localizedHref(`/news/${a.slug}`, lang)}
                className={`text-sm hover:underline underline-offset-2 ${
                  lang === "hi" ? "font-body-hi" : "font-body"
                }`}
              >
                {pick(a.title, lang)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
