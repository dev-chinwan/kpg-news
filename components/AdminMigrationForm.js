"use client";

import { useState } from "react";

function prettyJson(value) {
  return JSON.stringify(value, null, 2);
}

export default function AdminMigrationForm() {
  const [maxItems, setMaxItems] = useState("0");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ error: false, message: "" });
  const [reportText, setReportText] = useState("");

  async function runMigration({ dryRun, deleteLegacy }) {
    setLoading(true);
    setStatus({ error: false, message: "Migration request चल रही है..." });

    try {
      const payload = {
        dryRun,
        deleteLegacy,
        maxItems: Number(maxItems || 0),
      };

      const response = await fetch("/api/admin/articles/migrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Migration run नहीं हो सकी।");
      }

      setReportText(prettyJson(data.report || {}));

      const migrated = Number(data?.report?.migratedCount || 0);
      const skipped = Number(data?.report?.skippedCount || 0);
      const deleted = Number(data?.report?.deletedLegacyCount || 0);

      setStatus({
        error: false,
        message: `Done: migrated=${migrated}, skipped=${skipped}, deleted=${deleted}`,
      });
    } catch (error) {
      setStatus({
        error: true,
        message: error?.message || "Migration के दौरान त्रुटि हुई।",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 border border-rule rounded-xl p-5 bg-white">
      <h2 className="font-display-hi text-xl font-semibold text-ink mb-2">
        Legacy Articles Migration (Cloudinary)
      </h2>
      <p className="text-sm text-slate font-body-hi mb-4">
        पहले Dry Run चलाएं, फिर Migration करें, और अंत में verification के बाद Cleanup चलाएं।
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-3 font-body-hi">
        <label className="text-sm text-slate grid gap-1">
          Max items (0 = all)
          <input
            type="number"
            min="0"
            value={maxItems}
            onChange={(e) => setMaxItems(e.target.value)}
            className="border border-rule rounded-lg px-3 py-2 text-ink"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3 mb-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => runMigration({ dryRun: true, deleteLegacy: false })}
          className="px-4 py-2 rounded-lg border border-rule text-sm font-body-hi bg-paper-dim text-ink disabled:opacity-60"
        >
          Dry Run
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => runMigration({ dryRun: false, deleteLegacy: false })}
          className="px-4 py-2 rounded-lg text-sm font-body-hi bg-ink text-paper disabled:opacity-60"
        >
          Migrate (Keep Legacy)
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => runMigration({ dryRun: false, deleteLegacy: true })}
          className="px-4 py-2 rounded-lg text-sm font-body-hi bg-sindoor text-white disabled:opacity-60"
        >
          Cleanup (Delete Legacy)
        </button>
      </div>

      {status.message ? (
        <p className={`mt-2 text-sm font-body-hi ${status.error ? "text-red-700" : "text-green-700"}`}>
          {status.message}
        </p>
      ) : null}

      <textarea
        readOnly
        value={reportText}
        rows={14}
        className="w-full mt-3 border border-rule rounded-lg px-3 py-2 font-mono text-xs text-ink"
        placeholder="Migration report यहां दिखाई देगा"
      />
    </section>
  );
}
