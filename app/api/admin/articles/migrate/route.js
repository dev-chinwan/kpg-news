import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";
import { enforceRateLimit } from "@/lib/rateLimit";
import { migrateLegacyArticlesToV1 } from "@/lib/cloudinaryNews";

function isLegacyMigrationEnabled() {
  return (
    String(process.env.ENABLE_LEGACY_ARTICLES_MIGRATION || "")
      .trim()
      .toLowerCase() === "true"
  );
}

export async function POST(request) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  if (!isLegacyMigrationEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Legacy migration is disabled. Set ENABLE_LEGACY_ARTICLES_MIGRATION=true to enable.",
      },
      { status: 403 }
    );
  }

  const limited = enforceRateLimit(request, {
    routeKey: "admin-articles-migrate-post",
    limit: 3,
    windowMs: 10 * 60 * 1000,
    message: "Too many migration attempts. Try again in a few minutes.",
  });
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => ({}));

    const dryRun = body?.dryRun !== false;
    const deleteLegacy = body?.deleteLegacy === true;
    const maxItems = Number(body?.maxItems || 0);

    const report = await migrateLegacyArticlesToV1({
      dryRun,
      deleteLegacy,
      maxItems,
    });

    return NextResponse.json({
      ok: true,
      report,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Migration failed.",
      },
      { status: 500 }
    );
  }
}
