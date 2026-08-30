import { NextResponse } from "next/server";
import newsData from "@/data/news.json";

// A tiny read-only route handler. Kept intentionally trivial for the
// demo — see README "Migrating from JSON to an API" for how this same
// route would eventually query a real database instead of the local
// JSON file, with the response shape staying identical.
export async function GET() {
  return NextResponse.json(newsData);
}
