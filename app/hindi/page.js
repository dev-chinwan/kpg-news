import { redirect } from "next/navigation";

// Hindi is the only language now, so this remains a convenience alias.
export default function HindiShortcutPage() {
  redirect("/");
}
