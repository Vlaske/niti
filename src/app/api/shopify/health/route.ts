import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify/client";
import {
  getShopifyTokenMode,
  shopifyServerConfigured,
} from "@/lib/shopify/config";
import { SHOP_NAME_QUERY } from "@/lib/shopify/queries";

/**
 * Lightweight Shopify connectivity check.
 * In production require ?key=HEALTH_CHECK_SECRET (or omit secret → 404).
 */
export async function GET(request: NextRequest) {
  const secret = process.env.HEALTH_CHECK_SECRET?.trim();
  if (process.env.NODE_ENV === "production") {
    if (!secret || request.nextUrl.searchParams.get("key") !== secret) {
      return new NextResponse(null, { status: 404 });
    }
  }

  if (!shopifyServerConfigured) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message: "Shopify nije konfigurisan.",
      },
      { status: 503 }
    );
  }

  try {
    const data = await shopifyFetch<{
      shop: { name: string };
    }>(SHOP_NAME_QUERY, undefined, { revalidate: false });

    return NextResponse.json({
      ok: true,
      configured: true,
      shopName: data.shop.name,
      tokenMode: getShopifyTokenMode(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        message: e instanceof Error ? e.message : "Shopify greška",
      },
      { status: 502 }
    );
  }
}
