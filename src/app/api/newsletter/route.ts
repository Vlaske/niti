import { NextRequest, NextResponse } from "next/server";
import {
  newsletterAdminConfigured,
  subscribeToNewsletter,
} from "@/lib/shopify/newsletter";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hits = new Map<string, number[]>();

function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < 10 * 60 * 1000);
  if (recent.length >= 5) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(request: NextRequest) {
  let body: { email?: string; website?: string };
  try {
    body = (await request.json()) as { email?: string; website?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooMany(ip)) {
    return NextResponse.json({ ok: false, error: "failed" }, { status: 429 });
  }

  if (!newsletterAdminConfigured()) {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });
  }

  try {
    await subscribeToNewsletter(email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "[newsletter]",
      error instanceof Error ? error.message : "signup failed"
    );
    return NextResponse.json({ ok: false, error: "failed" }, { status: 502 });
  }
}
