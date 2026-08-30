"use client";

import { useState } from "react";

const INITIAL_FORM = {
  id: "",
  slug: "",
  titleHi: "",
  summaryHi: "",
  contentHi: "",
  category: "local",
  location: "dehradun",
  author: "",
  source: "",
  sourceUrl: "",
  imageUrl: "",
  publishedAt: "",
  tags: "",
  views: "0",
  featured: false,
  breaking: false,
  trending: false,
};

export default function AdminPostForm({ categories, locations }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [savedArticles, setSavedArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [status, setStatus] = useState({ loading: false, message: "", error: false });

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
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

  function loadFormBySlug(slug) {
    setSelectedSlug(slug);
    const article = savedArticles.find((item) => item.slug === slug);
    if (!article) return;

    setForm({
      id: article.id || "",
      slug: article.slug || "",
      titleHi: article.title?.hi || "",
      summaryHi: article.summary?.hi || "",
      contentHi: Array.isArray(article.content?.hi)
        ? article.content.hi.join("\n")
        : "",
      category: article.category || categories?.[0]?.id || "local",
      location: article.location || locations?.[0]?.id || "dehradun",
      author: article.author || "",
      source: article.source || "",
      sourceUrl: article.sourceUrl || "",
      imageUrl: article.image || "",
      publishedAt: article.publishedAt || "",
      tags: Array.isArray(article.tags) ? article.tags.join(", ") : "",
      views: String(article.views ?? 0),
      featured: Boolean(article.featured),
      breaking: Boolean(article.breaking),
      trending: Boolean(article.trending),
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, message: "पोस्ट सेव हो रही है...", error: false });

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
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
        message: `पोस्ट सफलतापूर्वक सेव हुई: /news/${json.article.slug}`,
        error: false,
      });
      setImageFile(null);
      setForm({ ...INITIAL_FORM, category: form.category, location: form.location });
    } catch (error) {
      setStatus({
        loading: false,
        message: error?.message || "पोस्ट सेव करते समय त्रुटि हुई।",
        error: true,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 border border-rule rounded-xl p-5 bg-white">
      <h2 className="font-display-hi text-xl font-semibold text-ink">नई खबर सेव करें (Cloudinary)</h2>

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
          अपडेट के लिए खबर चुनें (वैकल्पिक)
          <select
            value={selectedSlug}
            onChange={(e) => loadFormBySlug(e.target.value)}
            className="border border-rule rounded-lg px-3 py-2 text-ink"
          >
            <option value="">नई खबर बनाएं</option>
            {savedArticles.map((article) => (
              <option key={article.slug} value={article.slug}>
                {article.title?.hi || article.slug}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4 font-body-hi">
        <label className="text-sm text-slate grid gap-1">
          स्लग *
          <input
            required
            value={form.slug}
            onChange={(e) => setField("slug", e.target.value)}
            className="border border-rule rounded-lg px-3 py-2 text-ink"
            placeholder="example-khabar-slug"
          />
        </label>

        <label className="text-sm text-slate grid gap-1">
          यूनिक आईडी (वैकल्पिक)
          <input
            value={form.id}
            onChange={(e) => setField("id", e.target.value)}
            className="border border-rule rounded-lg px-3 py-2 text-ink"
            placeholder="ऑटो-जनरेट होने दें"
          />
        </label>
      </div>

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
        सारांश (हिंदी)
        <textarea
          rows={3}
          value={form.summaryHi}
          onChange={(e) => setField("summaryHi", e.target.value)}
          className="border border-rule rounded-lg px-3 py-2 text-ink"
          placeholder="खाली छोड़ने पर कंटेंट से ऑटो-सारांश बन जाएगा"
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
          स्रोत
          <input
            value={form.source}
            onChange={(e) => setField("source", e.target.value)}
            className="border border-rule rounded-lg px-3 py-2 text-ink"
          />
        </label>

        <label className="text-sm text-slate grid gap-1">
          प्रकाशित समय (ISO)
          <input
            value={form.publishedAt}
            onChange={(e) => setField("publishedAt", e.target.value)}
            className="border border-rule rounded-lg px-3 py-2 text-ink"
            placeholder="2026-08-30T10:00:00+05:30"
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
          स्रोत URL (वैकल्पिक)
          <input
            value={form.sourceUrl}
            onChange={(e) => setField("sourceUrl", e.target.value)}
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
            onChange={(e) => setField("featured", e.target.checked)}
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

      <button
        type="submit"
        disabled={status.loading}
        className="justify-self-start px-5 py-2 rounded-full bg-ink text-paper font-body-hi text-sm font-semibold hover:bg-sindoor-dark transition-colors disabled:opacity-60"
      >
        {status.loading ? "सेव हो रहा है..." : "Cloudinary में सेव करें"}
      </button>

      {status.message ? (
        <p className={`text-sm font-body-hi ${status.error ? "text-red-700" : "text-green-700"}`}>
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
