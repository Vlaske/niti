import { NextResponse } from "next/server";
import {
  getShopifyTokenMode,
  shopifyClientEnabled,
  shopifyServerConfigured,
  shopifyStoreDomain,
} from "@/lib/shopify/config";

/** Bez tajni — za debug da li su env varijable učitane. */
export async function GET() {
  return NextResponse.json({
    serverConfigured: shopifyServerConfigured,
    clientCartEnabled: shopifyClientEnabled,
    domain: shopifyStoreDomain || null,
    tokenMode: getShopifyTokenMode(),
    cartFlow: "browser → /api/shopify/cart → Shopify (private token on server)",
  });
}
