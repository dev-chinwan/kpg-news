"use client";

import { useState } from "react";

const INITIAL_FORM = {
  id: "",
  titleHi: "",
  summaryHi: "",
  contentHi: "",
  category: "",
  location: "",
  author: "",
  source: "",
  imageUrl: "",
  publishedAt: null,
  tags: "",
  views: "0",
  featured: true,
  breaking: false,
  trending: false,
};

function buildInitialForm(categories, locations) {
  return {
    ...INITIAL_FORM,
    category: categories?.[0]?.id || "local",
    location: locations?.[0]?.id || "karanprayag",
    publishedAt: new Date().toISOString(),
  };
}

function toDatetimeLocalValue(value) {
  const input = String(value || "").trim();
  if (!input) return "";

  const date = new Date(input);
  if (!Number.isNaN(date.getTime())) {
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
  }

  return input.slice(0, 16);
}

function toIsoDateTime(value) {
  const input = String(value || "").trim();
  if (!input) return "";

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toISOString();
}

export default function AdminPostForm({ categories, locations }) {
  const [form, setForm] = useState(buildInitialForm(categories, locations));
  const [imageFile, setImageFile] = useState(null);
  const [selectedArticleId, setSelectedArticleId] = useState("");
  const [savedArticles, setSavedArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [status, setStatus] = useState({ loading: false, message: "", error: false });

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetToNewForm() {
    setSelectedArticleId("");
    setImageFile(null);
    setForm(buildInitialForm(categories, locations));
  }

  async function loadArticles() {
    setLoadingArticles(true);
    setStatus({ loading: false, message: "मौजूदा खबरें लोड हो रही हैं...", error: false });
    try {
      const response = await fetch("/api/admin/articles", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || "खबरें लोड नहीं हो सकीं।");
      }
      const articles = Array.isArray(json?.articles) ? json.articles : [];
      setSavedArticles(articles);
      setStatus({
        loading: false,
        message: `${articles.length} खबरें लोड हुईं।`,
        error: false,
      });
    } catch (error) {
      setStatus({
        loading: false,
        message: error?.message || "खबरें लोड करते समय त्रुटि हुई।",
        error: true,
      });
    } finally {
      setLoadingArticles(false);
    }
  }

  function loadFormById(articleId) {
    setSelectedArticleId(articleId);

    if (!articleId) {
      resetToNewForm();
      return;
    }

    const article = savedArticles.find((item) => item.id === articleId);
    if (!article) return;

    setForm({
      id: article.id || "",
      titleHi: article.title?.hi || "",
      summaryHi: article.summary?.hi || "",
      contentHi: Array.isArray(article.content?.hi)
        ? article.content.hi.join("\n")
        : "",
      category: article.category || categories?.[0]?.id || "local",
      location: article.location || locations?.[0]?.id || "dehradun",
      author: article.author || "",
      source: article.source || "",
      imageUrl: article.image || "",
      publishedAt: toDatetimeLocalValue(article.publishedAt),
      tags: Array.isArray(article.tags) ? article.tags.join(", ") : "",
      views: String(article.views ?? 0),
      featured: true,
      breaking: Boolean(article.breaking),
      trending: Boolean(article.trending),
    });

    setImageFile(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const isUpdate = Boolean(selectedArticleId);
    setStatus({
      loading: true,
      message: isUpdate ? "खबर अपडेट हो रही है..." : "नई खबर सेव हो रही है...",
      error: false,
    });

    try {
      const payload = new FormData();
      const normalizedForm = {
        ...form,
        publishedAt: toIsoDateTime(form.publishedAt),
      };

      Object.entries(normalizedForm).forEach(([key, value]) => {
        payload.append(key, typeof value === "boolean" ? String(value) : value);
      });
      if (imageFile) payload.append("image", imageFile);

      const response = await fetch("/api/admin/articles", {
        method: "POST",
        body: payload,
      });

      const json = await response.json();
      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || "पोस्ट सेव नहीं हो सकी।");
      }

      setStatus({
        loading: false,
        message: isUpdate
          ? `खबर अपडेट हो गई: /news/${json.article.id}`
          : `नई खबर सेव हो गई: /news/${json.article.id}`,
        error: false,
      });
      resetToNewForm();
      await loadArticles();
    } catch (error) {
      setStatus({
        loading: false,
        message: error?.message || "पोस्ट सेव करते समय त्रुटि हुई।",
        error: true,
      });
    }
  }

  async function handleDelete() {
    if (!selectedArticleId) {
      setStatus({ loading: false, message: "डिलीट के लिए पहले खबर चुनें।", error: true });
      return;
    }

    setStatus({ loading: true, message: "खबर डिलीट हो रही है...", error: false });

    try {
      const response = await fetch(`/api/admin/articles?id=${encodeURIComponent(selectedArticleId)}`, {
        method: "DELETE",
      });

      const json = await response.json();
      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || "खबर डिलीट नहीं हो सकी।");
      }

      setStatus({
        loading: false,
        message: `खबर डिलीट हो गई: ${selectedArticleId}`,
        error: false,
      });
      resetToNewForm();
      await loadArticles();
    } catch (error) {
      setStatus({
        loading: false,
        message: error?.message || "डिलीट करते समय त्रुटि हुई।",
        error: true,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 border border-rule rounded-xl p-5 bg-white">
      <h2 className="font-display-hi text-xl font-semibold text-ink">सरल खबर फॉर्म (Cloudinary)</h2>

      <div className="grid md:grid-cols-[auto_1fr] gap-3 items-end">
        <button
          type="button"
          onClick={loadArticles}
          disabled={loadingArticles || status.loading}
          className="px-4 py-2 rounded-lg bg-paper-dim border border-rule text-sm font-body-hi text-ink disabled:opacity-60"
        >
          {loadingArticles ? "लोड हो रहा है..." : "मौजूदा खबरें लोड करें"}
        </button>

        <label className="text-sm text-slate grid gap-1 font-body-hi">
          अपडेट/डिलीट के लिए खबर चुनें (वैकल्पिक)
          <select
            value={selectedArticleId}
            onChange={(e) => loadFormById(e.target.value)}
            className="border border-rule rounded-lg px-3 py-2 text-ink"
          >
            <option value="">नई खबर बनाएं</option>
            {savedArticles.map((article) => (
              <option key={article.id} value={article.id}>
                {(article.title?.hi || article.id).slice(0, 90)} ({article.id})
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedArticleId ? (
        <p className="text-xs text-slate font-body-hi">एडिट मोड: {selectedArticleId}</p>
      ) : (
        <p className="text-xs text-slate font-body-hi">नई खबर पर ID और URL अपने-आप बनेंगे।</p>
      )}

      <label className="text-sm text-slate grid gap-1 font-body-hi">
        शीर्षक (हिंदी) *
        <input
          required
          value={form.titleHi}
          onChange={(e) => setField("titleHi", e.target.value)}
          className="border border-rule rounded-lg px-3 py-2 text-ink"
        />
      </label>

      <label className="text-sm text-slate grid gap-1 font-body-hi">
        सारांश (हिंदी) *
        <textarea
          required
          rows={3}
          value={form.summaryHi}
          onChange={(e) => setField("summaryHi", e.target.value)}
          className="border border-rule rounded-lg px-3 py-2 text-ink"
          placeholder="2-3 वाक्य का छोटा सारांश"
        />
      </label>

      <label className="text-sm text-slate grid gap-1 font-body-hi">
        कंटेंट (हिंदी) *
        <textarea
          required
          rows={8}
          value={form.contentHi}
          onChange={(e) => setField("contentHi", e.target.value)}
          className="border border-rule rounded-lg px-3 py-2 text-ink"
          placeholder="हर पैराग्राफ नई लाइन में लिखें"
        />
      </label>

      <details open className="border border-rule rounded-lg p-4 bg-paper-dim/40">
        <summary className="cursor-pointer text-sm font-semibold text-ink font-body-hi">
          वैकल्पिक फ़ील्ड्स (श्रेणी, लेखक, इमेज, टैग्स आदि)
        </summary>

        <div className="mt-4 grid gap-4">
          <div className="grid md:grid-cols-2 gap-4 font-body-hi">
            <label className="text-sm text-slate grid gap-1">
              श्रेणी
              <select
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                className="border border-rule rounded-lg px-3 py-2 text-ink"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name?.hi || category.id}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-slate grid gap-1">
              लोकेशन
              <select
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                className="border border-rule rounded-lg px-3 py-2 text-ink"
              >
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name?.hi || location.id}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid md:grid-cols-3 gap-4 font-body-hi">
            <label className="text-sm text-slate grid gap-1">
              लेखक
              <input
                value={form.author}
                onChange={(e) => setField("author", e.target.value)}
                className="border border-rule rounded-lg px-3 py-2 text-ink"
              />
            </label>

            <label className="text-sm text-slate grid gap-1">
              प्रकाशित समय (ISO)
              <input
                type="datetime-local"
                value={form.publishedAt}
                onChange={(e) => setField("publishedAt", e.target.value)}
                className="border border-rule rounded-lg px-3 py-2 text-ink"
              />
            </label>
          </div>

          <div className="grid md:grid-cols-3 gap-4 font-body-hi">
            <label className="text-sm text-slate grid gap-1">
              टैग्स (comma separated)
              <input
                value={form.tags}
                onChange={(e) => setField("tags", e.target.value)}
                className="border border-rule rounded-lg px-3 py-2 text-ink"
                placeholder="स्थानीय, ट्रैफिक"
              />
            </label>

            <label className="text-sm text-slate grid gap-1">
              व्यूज़
              <input
                type="number"
                min="0"
                value={form.views}
                onChange={(e) => setField("views", e.target.value)}
                className="border border-rule rounded-lg px-3 py-2 text-ink"
              />
            </label>
            <label className="text-sm text-slate grid gap-1">
              स्रोत
              <input
                value={form.source}
                onChange={(e) => setField("source", e.target.value)}
                className="border border-rule rounded-lg px-3 py-2 text-ink"
              />
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4 font-body-hi">
            <label className="text-sm text-slate grid gap-1">
              नई इमेज अपलोड करें
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="border border-rule rounded-lg px-3 py-2 text-ink file:mr-3 file:border-0 file:bg-sindoor file:text-white file:px-3 file:py-1 file:rounded"
              />
            </label>

            <label className="text-sm text-slate grid gap-1">
              या पुरानी इमेज URL दें
              <input
                value={form.imageUrl}
                onChange={(e) => setField("imageUrl", e.target.value)}
                className="border border-rule rounded-lg px-3 py-2 text-ink"
                placeholder="https://..."
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-slate font-body-hi">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.featured}
                disabled
                readOnly
              />
              प्रमुख खबर
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.breaking}
                onChange={(e) => setField("breaking", e.target.checked)}
              />
              ब्रेकिंग
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.trending}
                onChange={(e) => setField("trending", e.target.checked)}
              />
              ट्रेंडिंग
            </label>
          </div>
        </div>
      </details>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={status.loading}
          className="px-5 py-2 rounded-full bg-ink text-paper font-body-hi text-sm font-semibold hover:bg-sindoor-dark transition-colors disabled:opacity-60"
        >
          {status.loading
            ? "सेव हो रहा है..."
            : selectedArticleId
            ? "अपडेट सेव करें"
            : "नई खबर सेव करें"}
        </button>

        {selectedArticleId ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={status.loading}
            className="px-5 py-2 rounded-full bg-red-700 text-white font-body-hi text-sm font-semibold hover:bg-red-800 transition-colors disabled:opacity-60"
          >
            खबर डिलीट करें
          </button>
        ) : null}

        <button
          type="button"
          onClick={resetToNewForm}
          disabled={status.loading}
          className="px-5 py-2 rounded-full border border-rule text-ink font-body-hi text-sm font-semibold hover:bg-paper-dim transition-colors disabled:opacity-60"
        >
          फॉर्म रीसेट
        </button>
      </div>

      {status.message ? (
        <p className={`text-sm font-body-hi ${status.error ? "text-red-700" : "text-green-700"}`}>
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
