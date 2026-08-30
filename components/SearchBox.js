"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { t, localizedHref } from "@/lib/i18n";

export default function SearchBox({ lang, initialQuery = "", compact = false }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    const target = localizedHref(
      `/search${q ? `?q=${encodeURIComponent(q)}` : ""}`,
      lang
    );
    router.push(target);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label={t("search", lang)}
      className={`flex items-center gap-2 border border-rule rounded-full bg-white ${
        compact ? "px-3 py-1.5" : "px-4 py-2"
      }`}
    >
      <Search size={16} className="text-slate shrink-0" aria-hidden="true" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchPlaceholder", lang)}
        aria-label={t("searchPlaceholder", lang)}
        className={`w-full outline-none bg-transparent text-ink placeholder:text-slate/70 ${
          lang === "hi" ? "font-body-hi" : "font-body"
        } text-sm`}
      />
    </form>
  );
}
