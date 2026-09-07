"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ error: false, message: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus({ error: false, message: "Signing in..." });

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Login failed.");
      }

      setStatus({ error: false, message: "Login successful. Redirecting..." });
      router.push("/admin-preview");
      router.refresh();
    } catch (error) {
      setStatus({ error: true, message: error?.message || "Unable to sign in." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md border border-rule rounded-xl p-5 bg-white grid gap-4">
      <h1 className="font-display-hi text-2xl font-bold text-ink">Admin Sign In</h1>
      <p className="text-sm text-slate font-body-hi">
        Enter admin token once. Session cookie will keep you signed in.
      </p>

      <label className="text-sm text-slate grid gap-1 font-body-hi">
        Admin Token
        <input
          type="password"
          required
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="border border-rule rounded-lg px-3 py-2 text-ink"
          placeholder="ADMIN_AUTH_SECRET"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-ink text-paper font-body-hi disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      {status.message ? (
        <p className={`text-sm font-body-hi ${status.error ? "text-red-700" : "text-green-700"}`}>
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
