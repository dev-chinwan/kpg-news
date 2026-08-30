"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import CategoryNav from "./CategoryNav";
import SearchBox from "./SearchBox";
import { pick, localizedHref } from "@/lib/i18n";

export default function Header({
  lang,
  siteName,
  tagline,
  categories,
  dateLabel,
  activeCategory,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const fontHi = "font-display-hi";
  const fontBodyHi = "font-body-hi";

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-rule">
      {/* Dateline — signature masthead strip */}
      <div className="hidden md:block dateline">
        <div className="max-w-content mx-auto px-4 flex items-center justify-between py-1.5 text-[11px] tracking-[0.14em] uppercase text-slate font-mono">
          <span>{dateLabel}</span>
        </div>
      </div>

      <div className="max-w-content mx-auto px-4">
        {/* Masthead */}
        <div className="flex items-center justify-between py-3 md:py-4">
          <Link href={localizedHref("/", lang)} className="min-w-0">
            <div
              className={`${fontHi} text-2xl md:text-3xl font-bold tracking-tight text-ink leading-none`}
            >
              {siteName}
            </div>
            <div className={`hidden md:block ${fontBodyHi} text-xs text-sindoor mt-1 tracking-wide`}>
              {tagline}
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden md:block w-64">
              <SearchBox lang={lang} compact />
            </div>
            <button
              type="button"
              className="md:hidden p-2 -mr-2 text-ink"
              aria-label={menuOpen ? "मेनू बंद करें" : "मेनू खोलें"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Desktop category nav */}
        <div className="hidden md:block border-t border-rule">
          <CategoryNav
            categories={categories}
            lang={lang}
            activeCategory={activeCategory}
          />
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden border-t border-rule bg-paper">
          <div className="px-4 py-3">
            <SearchBox lang={lang} compact />
          </div>
          <nav className="flex flex-col px-4 pb-3" aria-label="Categories">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={localizedHref(`/category/${cat.id}`, lang)}
                onClick={() => setMenuOpen(false)}
                className={`py-2.5 border-b border-rule text-sm uppercase tracking-wide ${fontBodyHi} ${
                  cat.id === activeCategory
                    ? "text-sindoor font-semibold"
                    : "text-ink"
                }`}
              >
                {pick(cat.name, lang)}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
