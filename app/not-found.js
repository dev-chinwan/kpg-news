import Link from "next/link";

// This root not-found.js still renders inside the root layout (html/body
// already come from app/layout.js), so it only needs its own content.
// It can't reliably read the ?lang= query param here, so it shows both
// languages together — short and unambiguous either way a reader lands.
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-sindoor text-sm tracking-widest uppercase mb-4">404</p>
      <h1 className="text-2xl font-bold mb-2">Page not found · पेज नहीं मिला</h1>
      <p className="text-slate mb-6 max-w-sm">
        This page may have been moved or removed. यह पेज हटाया जा चुका है या स्थानांतरित किया गया है।
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-full bg-ink text-paper text-sm font-semibold hover:bg-sindoor transition-colors"
      >
        Back to homepage · होमपेज पर वापस जाएं
      </Link>
    </div>
  );
}
