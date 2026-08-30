// lib/i18n.js
//
// Small helper around /data/translations.json for UI-chrome strings
// (buttons, labels, empty states). Article content itself lives on
// each article object's { en, hi } fields and is read directly —
// this file is only for text that isn't tied to a specific article.

import translations from "@/data/translations.json";

export const SUPPORTED_LANGS = ["en", "hi"];
export const DEFAULT_LANG = "en";

export function normalizeLang(lang) {
  return SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
}

export function t(key, lang) {
  const entry = translations[key];
  if (!entry) return key;
  return entry[normalizeLang(lang)] ?? entry[DEFAULT_LANG] ?? key;
}

// Pull the right localized string off any { en, hi } shaped field,
// e.g. pick(article.title, lang).
export function pick(field, lang) {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[normalizeLang(lang)] ?? field[DEFAULT_LANG] ?? "";
}

export function formatDateTime(iso, lang) {
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", {
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
// English is the default and stays query-free; Hindi appends ?lang=hi
// (or &lang=hi if the path already has a query string).
export function localizedHref(path, lang) {
  if (normalizeLang(lang) !== "hi") return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}lang=hi`;
}

export function timeAgo(iso, lang) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - then);
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const isHi = lang === "hi";
  if (minutes < 1) return isHi ? "अभी-अभी" : "just now";
  if (minutes < 60)
    return isHi ? `${minutes} मिनट पहले` : `${minutes} min ago`;
  if (hours < 24) return isHi ? `${hours} घंटे पहले` : `${hours}h ago`;
  if (days < 7) return isHi ? `${days} दिन पहले` : `${days}d ago`;
  return formatDateTime(iso, lang);
}
