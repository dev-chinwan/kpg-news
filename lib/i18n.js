// lib/i18n.js
//
// Hindi-only language helpers used across pages/components.

export const SUPPORTED_LANGS = ["hi"];
export const DEFAULT_LANG = "hi";

export function normalizeLang(lang) {
  return SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
}

// Pull the right localized string off any { en, hi } shaped field,
// e.g. pick(article.title, lang).
export function pick(field, lang) {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field.hi ?? field[normalizeLang(lang)] ?? field[DEFAULT_LANG] ?? "";
}

export function formatDateTime(iso, lang) {
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat("hi-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    return iso;
  }
}

// Builds an href that preserves the current language across navigation.
// Hindi is the only supported language, so links are language-neutral.
export function localizedHref(path, lang) {
  return path;
}

export function timeAgo(iso, lang) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - then);
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "अभी-अभी";
  if (minutes < 60) return `${minutes} मिनट पहले`;
  if (hours < 24) return `${hours} घंटे पहले`;
  if (days < 7) return `${days} दिन पहले`;
  return formatDateTime(iso, lang);
}
