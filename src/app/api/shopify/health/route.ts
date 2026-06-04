import { NextRequest, NextResponse } from "next/server";
import {
  getShopifyTokenMode,
  shopifyServerConfigured,
  shopifyStoreDomain,
} from "@/lib/shopify/config";
import { shopifyFetch } from "@/lib/shopify/client";
import { SHOP_NAME_QUERY } from "@/lib/shopify/queries";

export async function GET(request: NextRequest) {
  if (!shopifyServerConfigured) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message:
          "Nedostaju SHOPIFY_STORE_DOMAIN i token. Vidi SHOPIFY_SETUP.md.",
      },
      { status: 503 }
    );
  }

  try {
    const data = await shopifyFetch<{
      shop: { name: string; primaryDomain?: { url: string } };
    }>(SHOP_NAME_QUERY, undefined, { revalidate: false });

    let cartOk: boolean | null = null;
    let cartHint: string | undefined;

    if (request.nextUrl.searchParams.get("testCart") === "1") {
      try {
        const { createCart } = await import("@/lib/shopify/cart");
        const cart = await createCart();
        cartOk = Boolean(cart.checkoutUrl);
      } catch (e) {
        cartOk = false;
        cartHint =
          e instanceof Error
            ? e.message
            : "Dodaj unauthenticated_write_checkouts u Headless dozvole.";
      }
    }

    return NextResponse.json({
      ok: true,
      configured: true,
      shopName: data.shop.name,
      domain: shopifyStoreDomain,
      tokenMode: getShopifyTokenMode(),
      primaryDomain: data.shop.primaryDomain?.url ?? null,
      ...(request.nextUrl.searchParams.has("testCart")
        ? { cartOk, cartHint }
        : {}),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nepoznata greška";
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        domain: shopifyStoreDomain,
        tokenMode: getShopifyTokenMode(),
        message,
        hint:
          getShopifyTokenMode() === "legacy"
            ? "Ako koristiš Headless kanal, prebaci token u SHOPIFY_STOREFRONT_PRIVATE_TOKEN."
            : "Proveri dozvole (scopes) u Headless kanalu ili Custom App.",
      },
      { status: 502 }
    );
  }
}
