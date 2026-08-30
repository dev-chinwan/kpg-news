import {
  Source_Serif_4,
  Inter,
  Noto_Serif_Devanagari,
  Noto_Sans_Devanagari,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";

const displayFont = Source_Serif_4({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const displayFontHi = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["500", "600", "700"],
  variable: "--font-display-hi",
  display: "swap",
});

const bodyFontHi = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-hi",
  display: "swap",
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "लोकल न्यूज़ — आपका शहर, आपकी खबर",
    template: "%s | लोकल न्यूज़",
  },
  description:
    "स्थानीय, राजनीति, व्यापार, अपराध, शिक्षा, खेल और मौसम की खबरों के लिए हिंदी न्यूज़ पोर्टल।",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body
        className={`${displayFont.variable} ${bodyFont.variable} ${displayFontHi.variable} ${bodyFontHi.variable} ${monoFont.variable} font-body bg-paper text-ink antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-sindoor focus:text-white focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
