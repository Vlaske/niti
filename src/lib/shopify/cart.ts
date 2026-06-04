import { shopifyFetch } from "@/lib/shopify/client";
import {
  mapCartLines,
  parseCartSubtotal,
  type ShopifyCartPayload,
} from "@/lib/shopify/mappers";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from "@/lib/shopify/queries";
import type { CartItem } from "@/types";

type CartMutationResult = {
  cart: ShopifyCartPayload | null;
  userErrors: { field: string[] | null; message: string }[];
};

function assertNoErrors(
  label: string,
  result: CartMutationResult | { cart: ShopifyCartPayload | null }
) {
  const errors = "userErrors" in result ? result.userErrors : [];
  if (errors?.length) {
    throw new Error(`${label}: ${errors.map((e) => e.message).join(", ")}`);
  }
  if (!result.cart) {
    throw new Error(`${label}: korpa nije vraćena`);
  }
}

export type CartState = {
  cartId: string;
  checkoutUrl: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
};

function toCartState(cart: ShopifyCartPayload): CartState {
  const items = mapCartLines(cart);
  return {
    cartId: cart.id,
    checkoutUrl: cart.checkoutUrl,
    items,
    itemCount: cart.totalQuantity,
    subtotal: parseCartSubtotal(cart),
  };
}

export async function createCart(buyerIp?: string): Promise<CartState> {
  const data = await shopifyFetch<{ cartCreate: CartMutationResult }>(
    CART_CREATE_MUTATION,
    undefined,
    { buyerIp, revalidate: false }
  );
  assertNoErrors("cartCreate", data.cartCreate);
  return toCartState(data.cartCreate.cart!);
}

export async function getCart(
  cartId: string,
  buyerIp?: string
): Promise<CartState | null> {
  const data = await shopifyFetch<{ cart: ShopifyCartPayload | null }>(
    CART_QUERY,
    { id: cartId },
    { buyerIp, revalidate: false }
  );
  if (!data.cart) return null;
  return toCartState(data.cart);
}

export async function addLinesToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
  buyerIp?: string
): Promise<CartState> {
  const data = await shopifyFetch<{ cartLinesAdd: CartMutationResult }>(
    CART_LINES_ADD_MUTATION,
    {
      cartId,
      lines: lines.map((l) => ({
        merchandiseId: l.merchandiseId,
        quantity: l.quantity,
      })),
    },
    { buyerIp, revalidate: false }
  );
  assertNoErrors("cartLinesAdd", data.cartLinesAdd);
  return toCartState(data.cartLinesAdd.cart!);
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
  buyerIp?: string
): Promise<CartState> {
  const data = await shopifyFetch<{ cartLinesUpdate: CartMutationResult }>(
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines: [{ id: lineId, quantity }] },
    { buyerIp, revalidate: false }
  );
  assertNoErrors("cartLinesUpdate", data.cartLinesUpdate);
  return toCartState(data.cartLinesUpdate.cart!);
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[],
  buyerIp?: string
): Promise<CartState> {
  const data = await shopifyFetch<{ cartLinesRemove: CartMutationResult }>(
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds },
    { buyerIp, revalidate: false }
  );
  assertNoErrors("cartLinesRemove", data.cartLinesRemove);
  return toCartState(data.cartLinesRemove.cart!);
}
