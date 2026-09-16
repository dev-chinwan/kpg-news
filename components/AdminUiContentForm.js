"use client";

import { useState } from "react";

const TEMPLATE = {
  schemaVersion: 1,
  site: {
    name: { en: "", hi: "कर्णप्रयाग न्यूज़" },
    tagline: { en: "", hi: "आपका शहर। आपकी खबर।" },
    logo: {
      url: "",
      alt: "कर्णप्रयाग न्यूज़",
      width: 180,
      height: 56,
    },
    defaultLanguage: "hi",
    demo: false,
  },
  categories: [],
  locations: [],
};

function normalizeContent(payload) {
  const site = payload?.site || TEMPLATE.site;
  const categories = Array.isArray(payload?.categories) ? payload.categories : [];
  const locations = Array.isArray(payload?.locations) ? payload.locations : [];

  return {
    schemaVersion: Number(payload?.schemaVersion || 1),
    site: {
      name: {
        hi: String(site?.name?.hi || "").trim(),
        en: String(site?.name?.en || "").trim(),
      },
      tagline: {
        hi: String(site?.tagline?.hi || "").trim(),
        en: String(site?.tagline?.en || "").trim(),
      },
      logo: {
        url: String(site?.logo?.url || "").trim(),
        alt: String(site?.logo?.alt || site?.name?.hi || "News Logo").trim(),
        width: Number(site?.logo?.width || 180),
        height: Number(site?.logo?.height || 56),
      },
      defaultLanguage: String(site?.defaultLanguage || "hi"),
      demo: Boolean(site?.demo),
    },
    categories: categories.map((item) => ({
      id: String(item?.id || "").trim(),
      name: {
        hi: String(item?.name?.hi || "").trim(),
        en: String(item?.name?.en || "").trim(),
      },
    })),
    locations: locations.map((item) => ({
      id: String(item?.id || "").trim(),
      name: {
        hi: String(item?.name?.hi || "").trim(),
        en: String(item?.name?.en || "").trim(),
      },
    })),
  };
}

function listToMultiline(items) {
  return items
    .filter((item) => item?.id && item?.name?.hi)
    .map((item) => `${item.id}|${item.name.hi}${item?.name?.en ? `|${item.name.en}` : ""}`)
    .join("\n");
}

function multilineToList(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id = "", hi = "", en = ""] = line.split("|").map((p) => p.trim());
      return {
        id,
        name: { hi, en },
      };
    })
    .filter((item) => item.id && item.name.hi);
}

function toForm(content) {
  const normalized = normalizeContent(content);
  return {
    schemaVersion: normalized.schemaVersion,
    siteNameHi: normalized.site.name.hi,
    siteNameEn: normalized.site.name.en,
    taglineHi: normalized.site.tagline.hi,
    taglineEn: normalized.site.tagline.en,
    logoUrl: normalized.site.logo.url,
    logoAlt: normalized.site.logo.alt,
    logoWidth: String(normalized.site.logo.width || 180),
    logoHeight: String(normalized.site.logo.height || 56),
    defaultLanguage: normalized.site.defaultLanguage,
    demo: Boolean(normalized.site.demo),
    categoriesText: listToMultiline(normalized.categories),
    locationsText: listToMultiline(normalized.locations),
  };
}

function toPayload(form) {
  return normalizeContent({
    schemaVersion: Number(form.schemaVersion || 1),
    site: {
      name: {
        hi: form.siteNameHi,
        en: form.siteNameEn,
      },
      tagline: {
        hi: form.taglineHi,
        en: form.taglineEn,
      },
      logo: {
        url: form.logoUrl,
        alt: form.logoAlt,
        width: Number(form.logoWidth || 180),
        height: Number(form.logoHeight || 56),
      },
      defaultLanguage: form.defaultLanguage || "hi",
      demo: Boolean(form.demo),
    },
    categories: multilineToList(form.categoriesText),
    locations: multilineToList(form.locationsText),
  });
}

export default function AdminUiContentForm() {
  const [form, setForm] = useState(toForm(TEMPLATE));
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [status, setStatus] = useState({ error: false, message: "" });

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function savePayload(payload) {
    const response = await fetch("/api/admin/ui-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data?.ok) {
      throw new Error(data?.error || "UI content save नहीं हो सका।");
    }

    const normalized = normalizeContent(data.content);
    setForm(toForm(normalized));
    return data;
  }

  async function loadFromCloudinary() {
    setLoading(true);
    setStatus({ error: false, message: "UI content लोड हो रहा है..." });
    try {
      const response = await fetch("/api/admin/ui-content", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "UI content load नहीं हो सका।");
      }

      const normalized = normalizeContent(data.content);
      setForm(toForm(normalized));

      if (data.source === "cloudinary") {
        setStatus({ error: false, message: "UI content Cloudinary से सफलतापूर्वक लोड हुआ।" });
      } else {
        const reason = data.reason ? ` (${data.reason})` : "";
        setStatus({
          error: true,
          message: `Cloudinary data नहीं मिला, local backup लोड हुआ${reason}`,
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
    setStatus({ error: false, message: "UI content सेव हो रहा है..." });

    try {
      const payload = toPayload(form);
      const data = await savePayload(payload);

      const link = data?.content?._secureUrl ? ` URL: ${data.content._secureUrl}` : "";
      setStatus({
        error: false,
        message: `UI content Cloudinary में सेव हो गया।${link}`,
      });
    } catch (error) {
      setStatus({ error: true, message: error?.message || "सेव करते समय त्रुटि।" });
    } finally {
      setLoading(false);
    }
  }

  async function uploadLogo() {
    if (!logoFile) {
      setStatus({ error: true, message: "पहले logo image चुनें।" });
      return;
    }

    setUploadingLogo(true);
    setStatus({ error: false, message: "Logo upload हो रहा है..." });

    try {
      const payload = new FormData();
      payload.append("logo", logoFile);

      const response = await fetch("/api/admin/ui-content/logo", {
        method: "POST",
        body: payload,
      });

      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Logo upload नहीं हो सका।");
      }

      const nextForm = {
        ...form,
        logoUrl: data.logoUrl || "",
        logoWidth: data.width ? String(data.width) : form.logoWidth,
        logoHeight: data.height ? String(data.height) : form.logoHeight,
      };

      setForm(nextForm);
      await savePayload(toPayload(nextForm));
      setLogoFile(null);
      setStatus({ error: false, message: "Logo upload और save सफल। अब frontend पर logo दिखेगा।" });
    } catch (error) {
      setStatus({ error: true, message: error?.message || "Logo upload में त्रुटि।" });
    } finally {
      setUploadingLogo(false);
    }
  }

  return (
    <section className="mt-8 border border-rule rounded-xl p-5 bg-white">
      <h2 className="font-display-hi text-xl font-semibold text-ink mb-2">
        UI कंटेंट मैनेजर (Cloudinary)
      </h2>
      <p className="text-sm text-slate font-body-hi mb-4">
        यहां आसान form से site settings (logo सहित), categories और locations अपडेट करें।
      </p>

      <div className="flex flex-wrap gap-3 mb-3">
        <button
          type="button"
          onClick={loadFromCloudinary}
          disabled={loading || uploadingLogo}
          className="px-4 py-2 rounded-lg border border-rule text-sm font-body-hi bg-paper-dim text-ink disabled:opacity-60"
        >
          Cloudinary से Load
        </button>
        <button
          type="button"
          onClick={saveToCloudinary}
          disabled={loading || uploadingLogo}
          className="px-4 py-2 rounded-lg text-sm font-body-hi bg-ink text-paper disabled:opacity-60"
        >
          Cloudinary में Save
        </button>
      </div>

      <div className="grid gap-4 border border-rule rounded-lg p-4 bg-paper-dim/30 mb-4">
        <div className="grid md:grid-cols-2 gap-4 font-body-hi">
          <label className="text-sm text-slate grid gap-1">
            Site Name (Hindi)
            <input
              value={form.siteNameHi}
              onChange={(e) => setField("siteNameHi", e.target.value)}
              className="border border-rule rounded-lg px-3 py-2 text-ink"
            />
          </label>
          <label className="text-sm text-slate grid gap-1">
            Site Name (English)
            <input
              value={form.siteNameEn}
              onChange={(e) => setField("siteNameEn", e.target.value)}
              className="border border-rule rounded-lg px-3 py-2 text-ink"
            />
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-4 font-body-hi">
          <label className="text-sm text-slate grid gap-1">
            Tagline (Hindi)
            <input
              value={form.taglineHi}
              onChange={(e) => setField("taglineHi", e.target.value)}
              className="border border-rule rounded-lg px-3 py-2 text-ink"
            />
          </label>
          <label className="text-sm text-slate grid gap-1">
            Tagline (English)
            <input
              value={form.taglineEn}
              onChange={(e) => setField("taglineEn", e.target.value)}
              className="border border-rule rounded-lg px-3 py-2 text-ink"
            />
          </label>
        </div>

        <div className="grid md:grid-cols-[2fr_1fr_1fr] gap-4 font-body-hi">
          <label className="text-sm text-slate grid gap-1">
            Logo URL
            <input
              value={form.logoUrl}
              onChange={(e) => setField("logoUrl", e.target.value)}
              placeholder="https://..."
              className="border border-rule rounded-lg px-3 py-2 text-ink"
            />
          </label>
          <label className="text-sm text-slate grid gap-1">
            Logo Width
            <input
              type="number"
              min="1"
              value={form.logoWidth}
              onChange={(e) => setField("logoWidth", e.target.value)}
              className="border border-rule rounded-lg px-3 py-2 text-ink"
            />
          </label>
          <label className="text-sm text-slate grid gap-1">
            Logo Height
            <input
              type="number"
              min="1"
              value={form.logoHeight}
              onChange={(e) => setField("logoHeight", e.target.value)}
              className="border border-rule rounded-lg px-3 py-2 text-ink"
            />
          </label>
        </div>

        <div className="grid md:grid-cols-[1fr_auto] gap-4 items-end font-body-hi">
          <label className="text-sm text-slate grid gap-1">
            Logo Alt Text
            <input
              value={form.logoAlt}
              onChange={(e) => setField("logoAlt", e.target.value)}
              className="border border-rule rounded-lg px-3 py-2 text-ink"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="border border-rule rounded-lg px-3 py-2 text-ink text-sm file:mr-3 file:border-0 file:bg-sindoor file:text-white file:px-3 file:py-1 file:rounded"
            />
            <button
              type="button"
              onClick={uploadLogo}
              disabled={loading || uploadingLogo}
              className="px-4 py-2 rounded-lg border border-rule text-sm font-body-hi bg-white text-ink disabled:opacity-60"
            >
              {uploadingLogo ? "Uploading..." : "Logo Upload"}
            </button>
          </div>
        </div>

        <label className="text-sm text-slate grid gap-1 font-body-hi">
          Categories (हर लाइन: id|Hindi Name|English Name)
          <textarea
            value={form.categoriesText}
            onChange={(e) => setField("categoriesText", e.target.value)}
            rows={6}
            className="w-full border border-rule rounded-lg px-3 py-2 font-mono text-xs text-ink"
            placeholder="local|स्थानीय|Local"
          />
        </label>

        <label className="text-sm text-slate grid gap-1 font-body-hi">
          Locations (हर लाइन: id|Hindi Name|English Name)
          <textarea
            value={form.locationsText}
            onChange={(e) => setField("locationsText", e.target.value)}
            rows={6}
            className="w-full border border-rule rounded-lg px-3 py-2 font-mono text-xs text-ink"
            placeholder="karanprayag|कर्णप्रयाग|Karanprayag"
          />
        </label>
      </div>

      {status.message ? (
        <p className={`mt-3 text-sm font-body-hi ${status.error ? "text-red-700" : "text-green-700"}`}>
          {status.message}
        </p>
      ) : null}
    </section>
  );
}
