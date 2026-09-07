import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminPostForm from "@/components/AdminPostForm";
import AdminUiContentForm from "@/components/AdminUiContentForm";
import AdminArticlesContentForm from "@/components/AdminArticlesContentForm";
import AdminMigrationForm from "@/components/AdminMigrationForm";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import { getAllNews, getCategories, getLocations, getStats } from "@/lib/news";
import { pick } from "@/lib/i18n";
import { ADMIN_SESSION_COOKIE, isAdminSessionValid } from "@/lib/adminSession";

export const metadata = {
  title: "एडमिन कंटेंट मैनेजमेंट",
  robots: { index: false, follow: false },
};

export default async function AdminPreviewPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  if (!isAdminSessionValid(sessionToken)) {
    redirect("/admin-login");
  }

  const lang = "hi";
  const [stats, categories, locations, latest] = await Promise.all([
    getStats(),
    getCategories(),
    getLocations(),
    getAllNews(),
  ]);

  const rows = [
    { label: "कुल खबरें", value: stats.total },
    { label: "ब्रेकिंग खबरें", value: stats.breaking },
    { label: "प्रमुख खबरें", value: stats.featured },
    { label: "ट्रेंडिंग खबरें", value: stats.trending },
  ];

  const latestFive = latest.slice(0, 5);
  const showLegacyMigration =
    String(process.env.ENABLE_LEGACY_ARTICLES_MIGRATION || "").trim().toLowerCase() ===
    "true";

  return (
    <SiteShell lang={lang}>
      <div className="max-w-content mx-auto px-4 py-10">
        <div className="flex justify-end mb-4">
          <AdminLogoutButton />
        </div>
        <h1 className="font-display-hi text-2xl font-bold text-ink mb-2">
          Cloudinary Admin Panel
        </h1>
        <p className="text-sm text-slate mb-8 max-w-3xl font-body-hi">
          यहां से सेव की गई खबर और इमेज Cloudinary में स्टोर होगी। website पहले Cloudinary से खबरें पढ़ेगा,
          आप नई खबर जोड़ सकते हैं या मौजूदा खबर लोड करके अपडेट कर सकते हैं।
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {rows.map((r) => (
            <div key={r.label} className="border border-rule rounded-lg p-5 bg-white">
              <div className="text-3xl font-bold font-mono text-sindoor">{r.value}</div>
              <div className="text-sm text-slate mt-1 font-body-hi">{r.label}</div>
            </div>
          ))}
        </div>

        <AdminPostForm categories={categories} locations={locations} />
        <AdminUiContentForm />
        <AdminArticlesContentForm />
        {showLegacyMigration ? <AdminMigrationForm /> : null}

        <div className="mt-8 border border-rule rounded-xl bg-white p-5">
          <h2 className="font-display-hi text-lg font-semibold text-ink mb-3">हाल में उपलब्ध खबरें</h2>
          <ul className="space-y-2 font-body-hi text-sm text-slate">
            {latestFive.map((article) => (
              <li key={article.id}>
                {pick(article.title, "hi")} - <Link className="text-sindoor hover:underline" href={`/news/${article.id}`}>देखें</Link>
              </li>
            ))}
          </ul>
          <a
            href="/api/news-preview"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 px-4 py-2 rounded-full bg-ink text-paper text-sm font-semibold hover:bg-sindoor-dark transition-colors font-body-hi"
          >
            मौजूदा JSON रिस्पॉन्स देखें
          </a>
        </div>
      </div>
    </SiteShell>
  );
}
