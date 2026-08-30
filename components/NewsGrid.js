import NewsCard from "./NewsCard";
import { pick } from "@/lib/i18n";

export default function NewsGrid({
  articles,
  lang,
  categories = [],
  locations = [],
  columns = 3,
  horizontal = false,
}) {
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const locMap = Object.fromEntries(locations.map((l) => [l.id, l]));

  const colClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid grid-cols-1 ${colClass} gap-x-6 gap-y-6`}>
      {articles.map((article) => (
        <NewsCard
          key={article.id}
          article={article}
          lang={lang}
          horizontal={horizontal}
          categoryName={
            catMap[article.category] ? pick(catMap[article.category].name, lang) : null
          }
          locationName={
            locMap[article.location] ? pick(locMap[article.location].name, lang) : null
          }
        />
      ))}
    </div>
  );
}
