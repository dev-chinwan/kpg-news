import Link from "next/link";
import { pick, localizedHref } from "@/lib/i18n";

export default function CategoryNav({ categories, lang, activeCategory }) {
  return (
    <nav
      aria-label="Categories"
      className="flex gap-5 overflow-x-auto whitespace-nowrap py-2 scrollbar-hide"
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeCategory;
        return (
          <Link
            key={cat.id}
            href={localizedHref(`/category/${cat.id}`, lang)}
            aria-current={isActive ? "page" : undefined}
            className={`text-sm tracking-wide uppercase shrink-0 pb-1 border-b-2 transition-colors ${
              lang === "hi" ? "font-body-hi" : "font-body"
            } ${
              isActive
                ? "border-sindoor text-ink font-semibold"
                : "border-transparent text-slate hover:text-ink hover:border-rule"
            }`}
          >
            {pick(cat.name, lang)}
          </Link>
        );
      })}
    </nav>
  );
}
