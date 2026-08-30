"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

// Preserves the current page/article and only swaps the ?lang= param,
// so switching language never loses the reader's place.
export default function LanguageSwitcher({ lang, compact = false }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(targetLang) {
    const params = new URLSearchParams(searchParams.toString());
    if (targetLang === "en") {
      params.delete("lang");
    } else {
      params.set("lang", targetLang);
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div
      className={`flex items-center gap-1 font-body text-sm ${
        compact ? "" : ""
      }`}
      role="group"
      aria-label="Language"
    >
      <Link
        href={hrefFor("en")}
        aria-current={lang === "en" ? "true" : undefined}
        className={`px-2 py-1 rounded transition-colors ${
          lang === "en"
            ? "bg-ink text-paper font-semibold"
            : "text-slate hover:text-ink"
        }`}
      >
        EN
      </Link>
      <span className="text-rule">|</span>
      <Link
        href={hrefFor("hi")}
        aria-current={lang === "hi" ? "true" : undefined}
        className={`px-2 py-1 rounded font-body-hi transition-colors ${
          lang === "hi"
            ? "bg-ink text-paper font-semibold"
            : "text-slate hover:text-ink"
        }`}
      >
        हिंदी
      </Link>
    </div>
  );
}
