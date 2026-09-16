"use client";

import { useState } from "react";

const TEMPLATE = {
  schemaVersion: 1,
  articles: [],
};

export default function AdminArticlesContentForm() {
  const [jsonText, setJsonText] = useState(JSON.stringify(TEMPLATE, null, 2));
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ error: false, message: "" });

  async function loadFromCloudinary() {
    setLoading(true);
    setStatus({ error: false, message: "Articles JSON लोड हो रहा है..." });

    try {
      const response = await fetch("/api/admin/articles-content", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Articles JSON load नहीं हो सका।");
      }

      setJsonText(JSON.stringify(data.content, null, 2));

      const count = Number(data?.content?.articles?.length || 0);
      if (data.source === "cloudinary") {
        setStatus({
          error: false,
          message: `Articles JSON Cloudinary से लोड हुआ (${count} articles)।`,
        });
      } else {
        const reason = data.reason ? ` (${data.reason})` : "";
        setStatus({
          error: true,
          message: `Cloudinary articles नहीं मिले, local backup लोड हुआ${reason}`,
        });
      }
    } catch (error) {
      setStatus({ error: true, message: error?.message || "लोड करते समय त्रुटि।" });
    } finally {
      setLoading(false);
    }
  }

  async function saveToCloudinary() {
    setLoading(true);
    setStatus({ error: false, message: "Articles JSON सेव हो रहा है..." });

    try {
      const payload = JSON.parse(jsonText);
      const response = await fetch("/api/admin/articles-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Articles JSON save नहीं हो सका।");
      }

      setJsonText(JSON.stringify(data.content, null, 2));
      const count = Number(data?.content?.articles?.length || 0);
      setStatus({
        error: false,
        message: `Articles JSON Cloudinary में सेव हो गया (${count} articles)।`,
      });
    } catch (error) {
      if (error instanceof SyntaxError) {
        setStatus({ error: true, message: "JSON format गलत है। पहले JSON सही करें।" });
      } else {
        setStatus({ error: true, message: error?.message || "सेव करते समय त्रुटि।" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 border border-rule rounded-xl p-5 bg-white">
      <h2 className="font-display-hi text-xl font-semibold text-ink mb-2">
        Article कंटेंट JSON (Cloudinary)
      </h2>
      <p className="text-sm text-slate font-body-hi mb-4">
        यहां से पूरा articles JSON देखें या bulk update करें। Save पर articles Cloudinary docs/index में sync होते हैं।
      </p>

      <div className="flex flex-wrap gap-3 mb-3">
        <button
          type="button"
          onClick={loadFromCloudinary}
          disabled={loading}
          className="px-4 py-2 rounded-lg border border-rule text-sm font-body-hi bg-paper-dim text-ink disabled:opacity-60"
        >
          Cloudinary से Load
        </button>
        <button
          type="button"
          onClick={saveToCloudinary}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-body-hi bg-ink text-paper disabled:opacity-60"
        >
          Cloudinary में Save
        </button>
      </div>

      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        rows={20}
        className="w-full border border-rule rounded-lg px-3 py-2 font-mono text-xs text-ink"
      />

      <p className="mt-2 text-xs text-slate font-body-hi">
        नोट: यह bulk upsert workflow है। किसी article को हटाने के लिए existing delete action इस्तेमाल करें।
      </p>

      {status.message ? (
        <p className={`mt-3 text-sm font-body-hi ${status.error ? "text-red-700" : "text-green-700"}`}>
          {status.message}
        </p>
      ) : null}
    </section>
  );
}
