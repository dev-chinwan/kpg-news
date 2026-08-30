import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { t, localizedHref } from "@/lib/i18n";

function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-7.6 8.68L23.3 22H16.6l-5.24-6.86L5.36 22H2.24l8.12-9.28L1.5 2h6.86l4.74 6.27L18.9 2Zm-1.18 18h1.7L7.36 3.9H5.53L17.72 20Z" />
    </svg>
  );
}

export default function Footer({ lang, siteName }) {
  const fontHi = lang === "hi" ? "font-display-hi" : "font-display";
  const fontBodyHi = lang === "hi" ? "font-body-hi" : "font-body";

  const links = [
    { key: "about", href: "/about" },
    { key: "contact", href: "/contact" },
    { key: "editorialPolicy", href: "/editorial-policy" },
    { key: "privacyPolicy", href: "/privacy-policy" },
    { key: "terms", href: "/terms" },
    { key: "advertise", href: "/advertise" },
  ];

  const socials = [
    { label: "Facebook", icon: <Facebook size={18} />, href: "#" },
    { label: "Instagram", icon: <Instagram size={18} />, href: "#" },
    { label: "YouTube", icon: <Youtube size={18} />, href: "#" },
    { label: "X", icon: <XIcon />, href: "#" },
  ];

  return (
    <footer className="border-t border-rule mt-12 bg-paper-dim">
      <div className="max-w-content mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div>
            <div className={`${fontHi} text-xl font-bold text-ink`}>{siteName}</div>
            <p className={`text-sm text-slate mt-2 max-w-xs ${fontBodyHi}`}>
              {t("tagline", lang)}
            </p>
            <div className="flex items-center gap-3 mt-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-rule text-slate hover:text-sindoor hover:border-sindoor transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-2">
            {links.map((l) => (
              <Link
                key={l.key}
                href={localizedHref(l.href, lang)}
                className={`text-sm text-slate hover:text-sindoor ${fontBodyHi}`}
              >
                {t(l.key, lang)}
              </Link>
            ))}
          </nav>
        </div>

        <div className={`mt-8 pt-6 border-t border-rule text-xs text-slate ${fontBodyHi}`}>
          © 2026 {siteName}. {t("allRightsReserved", lang)}
        </div>
      </div>
    </footer>
  );
}
