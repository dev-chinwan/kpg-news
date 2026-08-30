import { redirect } from "next/navigation";

// Convenience shortcut: /hindi always lands on the Hindi homepage.
// The rest of the site uses a `?lang=hi` query param (see README §
// "Language routing") so that switching language never loses the
// reader's current page or article.
export default function HindiShortcutPage() {
  redirect("/?lang=hi");
}
