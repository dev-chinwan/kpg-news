import SiteShell from "@/components/SiteShell";
import { getStats } from "@/lib/news";
import { normalizeLang, t } from "@/lib/i18n";

export const metadata = {
  title: "Admin Preview",
  robots: { index: false, follow: false },
};

export default async function AdminPreviewPage({ searchParams }) {
  const sp = await searchParams;
  const lang = normalizeLang(sp?.lang);
  const stats = await getStats();
  const fontHi = lang === "hi" ? "font-display-hi" : "font-display";
  const fontBodyHi = lang === "hi" ? "font-body-hi" : "font-body";

  const rows = [
    { label: t("totalArticles", lang), value: stats.total },
    { label: t("breakingCount", lang), value: stats.breaking },
    { label: t("featuredCount", lang), value: stats.featured },
    { label: t("trendingCount", lang), value: stats.trending },
  ];

  return (
    <SiteShell lang={lang}>
      <div className="max-w-content mx-auto px-4 py-10">
        <h1 className={`${fontHi} text-2xl font-bold text-ink mb-2`}>
          {t("adminTitle", lang)}
        </h1>
        <p className={`text-sm text-slate mb-8 max-w-xl ${fontBodyHi}`}>
          {lang === "hi"
            ? "यह केवल एक डेमो पूर्वावलोकन है। असली सोर्स ऑफ ट्रुथ /data/news.json फ़ाइल है — इसे संपादित करके साइट को अपडेट करें।"
            : "This is a read-only demo preview. The real source of truth remains /data/news.json — edit that file to update the site."}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {rows.map((r) => (
            <div key={r.label} className="border border-rule rounded-lg p-5 bg-white">
              <div className="text-3xl font-bold font-mono text-sindoor">{r.value}</div>
              <div className={`text-sm text-slate mt-1 ${fontBodyHi}`}>{r.label}</div>
            </div>
          ))}
        </div>

        <a
          href="/api/news-preview"
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-block px-4 py-2 rounded-full bg-ink text-paper text-sm font-semibold hover:bg-sindoor-dark transition-colors ${fontBodyHi}`}
        >
          {t("viewJson", lang)}
        </a>
      </div>
    </SiteShell>
  );
}
