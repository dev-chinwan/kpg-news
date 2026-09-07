"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      setLoading(false);
      router.push("/admin-login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="px-3 py-2 rounded-lg border border-rule text-sm font-body-hi text-ink bg-paper-dim disabled:opacity-60"
    >
      {loading ? "Signing out..." : "Sign Out"}
    </button>
  );
}
