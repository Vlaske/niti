import { NextRequest, NextResponse } from "next/server";
import { shopifyServerConfigured } from "@/lib/shopify/config";
import {
  addLinesToCart,
  createCart,
  getCart,
  removeCartLines,
  updateCartLine,
} from "@/lib/shopify/cart";
import { getVariantIdForColor } from "@/lib/shopify/mappers";
import type { CheckoutLocale } from "@/lib/shopify/checkout";
import type { Product } from "@/types";

function cartOptions(request: NextRequest): { locale: CheckoutLocale } {
  const locale = request.nextUrl.searchParams.get("locale");
  return { locale: locale === "en" ? "en" : "sr" };
}

function cartOptionsFromBody(
  body: { locale?: string },
  request: NextRequest
): { locale: CheckoutLocale } {
  if (body.locale === "en" || body.locale === "sr") {
    return { locale: body.locale };
  }
  return cartOptions(request);
}

function buyerIp(request: NextRequest): string | undefined {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    undefined
  );
}

export async function GET(request: NextRequest) {
  if (!shopifyServerConfigured) {
    return NextResponse.json({ error: "Shopify nije konfigurisan" }, { status: 503 });
  }

  const cartId = request.nextUrl.searchParams.get("cartId");
  if (!cartId) {
    return NextResponse.json({ error: "cartId je obavezan" }, { status: 400 });
  }

  try {
    const cart = await getCart(cartId, buyerIp(request), cartOptions(request));
    if (!cart) {
      return NextResponse.json({ error: "Korpa nije pronađena" }, { status: 404 });
    }
    return NextResponse.json(cart);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Greška";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

type CartActionBody = {
  action: "create" | "add" | "update" | "remove";
  cartId?: string;
  variantId?: string;
  product?: Product;
  selectedColor?: string;
  quantity?: number;
  lineId?: string;
  locale?: string;
};

export async function POST(request: NextRequest) {
  if (!shopifyServerConfigured) {
    return NextResponse.json({ error: "Shopify nije konfigurisan" }, { status: 503 });
  }

  let body: CartActionBody;
  try {
    body = (await request.json()) as CartActionBody;
  } catch {
    return NextResponse.json({ error: "Neispravan JSON" }, { status: 400 });
  }

  const ip = buyerIp(request);
  const options = cartOptionsFromBody(body, request);

  try {
    switch (body.action) {
      case "create": {
        const cart = await createCart(ip, options);
        return NextResponse.json(cart);
      }
      case "add": {
        if (!body.cartId) {
          return NextResponse.json({ error: "cartId je obavezan" }, { status: 400 });
        }
        const variantId =
          body.variantId ??
          (body.product
            ? getVariantIdForColor(body.product, body.selectedColor)
            : undefined);
        if (!variantId) {
          return NextResponse.json(
            { error: "variantId ili product je obavezan" },
            { status: 400 }
          );
        }
        const cart = await addLinesToCart(
          body.cartId,
          [{ merchandiseId: variantId, quantity: body.quantity ?? 1 }],
          ip,
          options
        );
        return NextResponse.json(cart);
      }
      case "update": {
        if (!body.cartId || !body.lineId) {
          return NextResponse.json(
            { error: "cartId i lineId su obavezni" },
            { status: 400 }
          );
        }
        const cart = await updateCartLine(
          body.cartId,
          body.lineId,
          body.quantity ?? 1,
          ip,
          options
        );
        return NextResponse.json(cart);
      }
      case "remove": {
        if (!body.cartId || !body.lineId) {
          return NextResponse.json(
            { error: "cartId i lineId su obavezni" },
            { status: 400 }
          );
        }
        const cart = await removeCartLines(body.cartId, [body.lineId], ip, options);
        return NextResponse.json(cart);
      }
      default:
        return NextResponse.json({ error: "Nepoznata akcija" }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Greška";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
