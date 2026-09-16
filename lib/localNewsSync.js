import { readFile, writeFile } from "fs/promises";
import path from "path";

const LOCAL_NEWS_PATH = path.join(process.cwd(), "data", "news.json");

let syncQueue = Promise.resolve();

function normalizeRoot(value) {
  if (!value || typeof value !== "object") return {};
  return value;
}

function normalizePatch(patch) {
  return {
    ...(patch?.site ? { site: patch.site } : {}),
    ...(Array.isArray(patch?.categories) ? { categories: patch.categories } : {}),
    ...(Array.isArray(patch?.locations) ? { locations: patch.locations } : {}),
    ...(Array.isArray(patch?.articles) ? { articles: patch.articles } : {}),
  };
}

async function runSync(patch) {
  const normalized = normalizePatch(patch);
  if (Object.keys(normalized).length === 0) return;

  let current = {};
  let currentRaw = "";

  try {
    currentRaw = await readFile(LOCAL_NEWS_PATH, "utf8");
    current = normalizeRoot(JSON.parse(currentRaw));
  } catch {
    current = {};
  }

  const next = {
    ...current,
    ...normalized,
  };

  const nextRaw = `${JSON.stringify(next, null, 2)}\n`;
  if (currentRaw === nextRaw) return;

  await writeFile(LOCAL_NEWS_PATH, nextRaw, "utf8");
}

export function syncLocalNewsJsonBestEffort(patch) {
  syncQueue = syncQueue
    .then(() => runSync(patch))
    .catch(() => {
      // Keep reads non-blocking even if local sync fails in restricted environments.
    });

  return syncQueue;
}
