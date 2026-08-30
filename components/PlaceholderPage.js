import SiteShell from "./SiteShell";
import { normalizeLang } from "@/lib/i18n";

export default async function PlaceholderPage({ searchParams, titleHi, bodyHi }) {
  const sp = await searchParams;
  const lang = normalizeLang(sp?.lang);
  const fontHi = "font-display-hi";
  const fontBodyHi = "font-body-hi";

  return (
    <SiteShell lang={lang}>
      <div className="mx-auto px-4 py-12 max-w-2xl">
        <h1 className={`${fontHi} text-2xl md:text-3xl font-bold text-ink border-b-2 border-sindoor pb-3 mb-6`}>
          {titleHi}
        </h1>
        <p className={`text-base text-slate leading-relaxed ${fontBodyHi}`}>
          {bodyHi}
        </p>
      </div>
    </SiteShell>
  );
}
