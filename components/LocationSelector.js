import Link from "next/link";
import { MapPin } from "lucide-react";
import { pick, localizedHref, t } from "@/lib/i18n";

export default function LocationSelector({ locations, lang, activeLocation }) {
  const fontHi = lang === "hi" ? "font-display-hi" : "font-display";
  const fontBodyHi = lang === "hi" ? "font-body-hi" : "font-body";

  return (
    <section aria-labelledby="location-heading" className="py-8 border-t border-rule">
      <h2
        id="location-heading"
        className={`${fontHi} text-lg font-bold uppercase tracking-wide text-ink mb-4 flex items-center gap-2`}
      >
        <MapPin size={18} className="text-sindoor" aria-hidden="true" />
        {t("byLocation", lang)}
      </h2>
      <div className="flex flex-wrap gap-2">
        {locations.map((loc) => {
          const isActive = loc.id === activeLocation;
          return (
            <Link
              key={loc.id}
              href={localizedHref(`/location/${loc.id}`, lang)}
              aria-current={isActive ? "page" : undefined}
              className={`px-4 py-1.5 rounded-full border text-sm ${fontBodyHi} transition-colors ${
                isActive
                  ? "bg-sindoor text-white border-sindoor"
                  : "border-rule text-ink hover:border-sindoor hover:text-sindoor"
              }`}
            >
              {pick(loc.name, lang)}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
