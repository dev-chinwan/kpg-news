"use client";

import { useEffect } from "react";

export default function ArticleViewTracker({ articleId, articleTitle }) {
  useEffect(() => {
    const id = String(articleId || "").trim();
    if (!id) return;

    const cacheKey = `view-tracked:${id}`;
    const lastTracked = Number(sessionStorage.getItem(cacheKey) || 0);
    const now = Date.now();

    if (now - lastTracked < 30 * 60 * 1000) {
      return;
    }

    sessionStorage.setItem(cacheKey, String(now));

    fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId: id, articleTitle: articleTitle || "" }),
      keepalive: true,
    }).catch(() => {
      // Ignore tracking errors in UI.
    });
  }, [articleId, articleTitle]);

  return null;
}
