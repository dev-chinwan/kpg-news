import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminPostForm from "@/components/AdminPostForm";
import AdminUiContentForm from "@/components/AdminUiContentForm";
import AdminArticlesContentForm from "@/components/AdminArticlesContentForm";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import { getAllNews, getCategories, getLocations } from "@/lib/news";
import { getStoredArticles } from "@/lib/cloudinaryNews";
import { getDashboardAnalytics } from "@/lib/analytics";
import { pick } from "@/lib/i18n";
import { ADMIN_ROLE, ADMIN_SESSION_COOKIE, getAdminSessionRole } from "@/lib/adminSession";

export const metadata = {
  title: "एडमिन कंटेंट मैनेजमेंट",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPreviewPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";
  const sessionRole = getAdminSessionRole(sessionToken);

  if (!sessionRole) {
    redirect("/admin-login");
  }

  const isFullAdmin = sessionRole === ADMIN_ROLE;

  const lang = "hi";
  const [categories, locations, cloudinaryArticles, allNews, analytics] = await Promise.all([
    getCategories(),
    getLocations(),
    getStoredArticles(),
    getAllNews(),
    getDashboardAnalytics({ days: 7, topPosts: 5 }),
  ]);

  const newsItems = cloudinaryArticles.length > 0 ? cloudinaryArticles : allNews;

  const totalNews = newsItems.length;
  const totalCategories = categories.length;
  const totalLocations = locations.length;

  const latestFive = newsItems.slice(0, 5);
  const sourceLabel = cloudinaryArticles.length > 0 ? "Cloudinary" : "Local JSON";
  const articleTitleMap = new Map(
    newsItems.map((item) => [String(item.id), pick(item.title, "hi") || String(item.id)])
  );

  return (
    <SiteShell lang={lang}>
       
      <div className="max-w-content mx-auto px-4 py-10">
        <div className="text-xs text-slate mt-1 font-body-hi">
            Total tracked visits: {analytics.totalViews}
        </div>
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

        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-rule rounded-lg p-6 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
            <div className="text-xs uppercase tracking-wide text-slate font-semibold">Dashboard</div>
            <div className="mt-2 text-4xl font-bold font-mono text-sindoor">{totalNews}</div>
            <div className="text-sm text-slate mt-1 font-body-hi">कुल खबरें</div>
          </div>

          <div className="border border-rule rounded-lg p-6 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
            <div className="text-3xl font-bold font-mono text-ink">{totalCategories}</div>
            <div className="text-sm text-slate mt-1 font-body-hi">कुल कैटेगरी</div>
          </div>

          <div className="border border-rule rounded-lg p-6 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
            <div className="text-3xl font-bold font-mono text-ink">{totalLocations}</div>
            <div className="text-sm text-slate mt-1 font-body-hi">कुल लोकेशन</div>
          </div>
        </div>

        <div className="mb-8 grid md:grid-cols-2 gap-4">
          <div className="border border-rule rounded-lg p-4 bg-white">
            <h2 className="font-display-hi text-base font-semibold text-ink mb-3">Day-wise Visits (7 days)</h2>
            <ul className="space-y-2 font-body-hi text-sm text-slate">
              {analytics.dayWise.map((item) => (
                <li key={item.day} className="flex items-center justify-between border-b border-rule/50 pb-1">
                  <span>{item.day}</span>
                  <span className="font-semibold text-ink">{item.visits}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-rule rounded-lg p-4 bg-white">
          <h2 className="font-display-hi text-base font-semibold text-ink mb-3">Most Viewed Posts</h2>
            
            <ul className="space-y-2 font-body-hi text-sm text-slate">
              {analytics.topPosts.length === 0 ? (
                <li>अभी तक view data नहीं है।</li>
              ) : (
                analytics.topPosts.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 border-b border-rule/50 pb-1">
                    <span className="text-ink">
                      {articleTitleMap.get(item.id) || item.title || item.id}
                    </span>
                    <span className="font-semibold text-ink shrink-0">{item.views}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <AdminPostForm categories={categories} locations={locations} />
        {isFullAdmin ? <AdminUiContentForm /> : null}
        {isFullAdmin ? <AdminArticlesContentForm /> : null}
        {!isFullAdmin ? (
          <div className="mt-8 border border-rule rounded-xl bg-paper-dim/50 p-4 text-sm text-slate font-body-hi">
            केवल खबर create/update/delete करना ही संभव है।
          </div>
        ) : null}

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
