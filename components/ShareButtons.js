"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { t } from "@/lib/i18n";

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.36a9.9 9.9 0 0 0 4.62 1.17h.01c5.46 0 9.9-4.45 9.9-9.9C21.95 6.45 17.5 2 12.04 2Zm5.8 14.02c-.24.68-1.38 1.3-1.9 1.34-.5.05-1.02.24-3.42-.72-2.9-1.16-4.76-4.1-4.9-4.29-.14-.19-1.17-1.56-1.17-2.98s.74-2.11 1-2.4c.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.15.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.29-.12.57.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.33 1.44.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.93.29.14.48.21.55.33.07.12.07.7-.17 1.37Z" />
    </svg>
  );
}

function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-7.6 8.68L23.3 22H16.6l-5.24-6.86L5.36 22H2.24l8.12-9.28L1.5 2h6.86l4.74 6.27L18.9 2Zm-1.18 18h1.7L7.36 3.9H5.53L17.72 20Z" />
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.5-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

export default function ShareButtons({ title, url, lang }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silently ignore, link is still visible in the URL bar.
    }
  }

  const encodedUrl = encodeURIComponent(url || "");
  const encodedTitle = encodeURIComponent(title || "");

  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: <WhatsAppIcon />,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <FacebookIcon />,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: <XIcon />,
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs uppercase tracking-wide text-slate font-semibold">
        {t("share", lang)}
      </span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t("share", lang)} ${l.label}`}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-rule text-ink hover:border-sindoor hover:text-sindoor transition-colors"
        >
          {l.icon}
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-rule text-ink hover:border-sindoor hover:text-sindoor transition-colors"
        aria-label={t("copyLink", lang)}
      >
        {copied ? <Check size={15} /> : <Link2 size={15} />}
      </button>
      {copied && (
        <span className="text-xs text-sindoor" role="status">
          {t("linkCopied", lang)}
        </span>
      )}
    </div>
  );
}
