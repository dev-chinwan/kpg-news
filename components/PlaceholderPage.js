import SiteShell from "./SiteShell";
import { normalizeLang } from "@/lib/i18n";

export default async function PlaceholderPage({ searchParams, titleEn, titleHi, bodyEn, bodyHi }) {
  const sp = await searchParams;
  const lang = normalizeLang(sp?.lang);
  const fontHi = lang === "hi" ? "font-display-hi" : "font-display";
  const fontBodyHi = lang === "hi" ? "font-body-hi" : "font-body";

  return (
    <SiteShell lang={lang}>
      <div className="mx-auto px-4 py-12 max-w-2xl">
        <h1 className={`${fontHi} text-2xl md:text-3xl font-bold text-ink border-b-2 border-sindoor pb-3 mb-6`}>
          {lang === "hi" ? titleHi : titleEn}
        </h1>
        <p className={`text-base text-slate leading-relaxed ${fontBodyHi}`}>
          {lang === "hi" ? bodyHi : bodyEn}
        </p>
      </div>
    </SiteShell>
  );
}
