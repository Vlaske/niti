"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLanguage } from "@/context/LanguageContext";
import { shopifyClientEnabled } from "@/lib/shopify/config";
import { getVariantIdForColor } from "@/lib/shopify/mappers";
import { getVariantIdFromSelections } from "@/lib/shopify/variants";
import type { CartItem, Product } from "@/types";

const CART_ID_KEY = "niti-shopify-cart-id";

type CartToast = {
  product?: Product;
  message?: string;
  variant: "success" | "error";
  visible: boolean;
};

type CartApiState = {
  cartId: string;
  checkoutUrl: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  checkoutUrl: string | null;
  isShopifyCart: boolean;
  cartLoading: boolean;
  cartError: string | null;
  toast: CartToast | null;
  addItem: (
    product: Product,
    quantity?: number,
    extras?: {
      variantId?: string;
      selectedColor?: string;
      selections?: Record<string, string>;
    }
  ) => void;
  removeItem: (lineOrProductId: string) => void;
  updateQuantity: (lineOrProductId: string, quantity: number) => void;
  clearCart: () => void;
  dismissToast: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

async function postCart(
  body: Record<string, unknown>,
  locale: string
): Promise<CartApiState> {
  const res = await fetch("/api/shopify/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, locale }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? "Greška pri radu sa korpom");
  }
  return json as CartApiState;
}

async function fetchCart(
  cartId: string,
  locale: string
): Promise<CartApiState | null> {
  const res = await fetch(
    `/api/shopify/cart?cartId=${encodeURIComponent(cartId)}&locale=${locale}`
  );
  if (res.status === 404) return null;
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? "Greška pri učitavanju korpe");
  }
  return json as CartApiState;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { locale } = useLanguage();
  const shopifyCart = shopifyClientEnabled;
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [cartLoading, setCartLoading] = useState(shopifyCart);
  const [cartError, setCartError] = useState<string | null>(null);
  const [toast, setToast] = useState<CartToast | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const applyRemoteCart = useCallback((cart: CartApiState) => {
    setItems(cart.items);
    setCartId(cart.cartId);
    setCheckoutUrl(cart.checkoutUrl);
    setSubtotal(cart.subtotal);
    localStorage.setItem(CART_ID_KEY, cart.cartId);
  }, []);

  const ensureCartId = useCallback(async (): Promise<string> => {
    const stored = localStorage.getItem(CART_ID_KEY);
    if (stored) {
      try {
        const existing = await fetchCart(stored, locale);
        if (existing) {
          applyRemoteCart(existing);
          return existing.cartId;
        }
      } catch {
        localStorage.removeItem(CART_ID_KEY);
      }
    }
    const created = await postCart({ action: "create" }, locale);
    applyRemoteCart(created);
    return created.cartId;
  }, [applyRemoteCart, locale]);

  useEffect(() => {
    if (!shopifyCart) {
      setCartLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const stored = localStorage.getItem(CART_ID_KEY);
        if (stored) {
          const cart = await fetchCart(stored, locale);
          if (!cancelled && cart) {
            applyRemoteCart(cart);
            return;
          }
          localStorage.removeItem(CART_ID_KEY);
        }
      } catch (e) {
        if (!cancelled) {
          setCartError(
            e instanceof Error ? e.message : "Greška pri učitavanju korpe"
          );
        }
      } finally {
        if (!cancelled) setCartLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shopifyCart, applyRemoteCart, locale]);

  const findItem = useCallback(
    (lineOrProductId: string) =>
      items.find(
        (i) =>
          i.lineId === lineOrProductId || i.product.id === lineOrProductId
      ),
    [items]
  );

  const showErrorToast = useCallback((message: string) => {
    setToast({ message, variant: "error", visible: true });
  }, []);

  const addItem = useCallback(
    (
      product: Product,
      quantity = 1,
      extras?: {
        variantId?: string;
        selectedColor?: string;
        selections?: Record<string, string>;
      }
    ) => {
      const selectedColor = extras?.selectedColor;

      if (!shopifyCart) {
        setToast({ product, variant: "success", visible: true });
        setItems((prev) => {
          const existing = prev.find(
            (i) =>
              i.product.id === product.id &&
              i.selectedColor === selectedColor
          );
          if (existing) {
            return prev.map((i) =>
              i.product.id === product.id &&
              i.selectedColor === selectedColor
                ? { ...i, quantity: i.quantity + quantity }
                : i
            );
          }
          return [...prev, { product, quantity, selectedColor }];
        });
        return;
      }

      (async () => {
        try {
          setCartError(null);
          const variantId =
            extras?.variantId ??
            (extras?.selections
              ? getVariantIdFromSelections(product, extras.selections)
              : getVariantIdForColor(product, selectedColor));
          if (!variantId) {
            throw new Error(
              "Proizvod nema Shopify varijantu (dodaj iz /shop ili proveri mock podatke)."
            );
          }
          const id = cartId ?? (await ensureCartId());
          const cart = await postCart(
            {
              action: "add",
              cartId: id,
              variantId,
              quantity,
            },
            locale
          );
          applyRemoteCart(cart);
          setToast({ product, variant: "success", visible: true });
        } catch (e) {
          const message = e instanceof Error ? e.message : "Greška";
          setCartError(message);
          showErrorToast(message);
        }
      })();
    },
    [shopifyCart, cartId, ensureCartId, applyRemoteCart, showErrorToast, locale]
  );

  const removeItem = useCallback(
    (lineOrProductId: string) => {
      if (!shopifyCart) {
        setItems((prev) => prev.filter((i) => i.product.id !== lineOrProductId));
        return;
      }

      const item = findItem(lineOrProductId);
      if (!item?.lineId || !cartId) return;

      (async () => {
        try {
          setCartError(null);
          const cart = await postCart(
            {
              action: "remove",
              cartId,
              lineId: item.lineId,
            },
            locale
          );
          applyRemoteCart(cart);
        } catch (e) {
          setCartError(e instanceof Error ? e.message : "Greška");
        }
      })();
    },
    [shopifyCart, cartId, findItem, applyRemoteCart, locale]
  );

  const updateQuantity = useCallback(
    (lineOrProductId: string, quantity: number) => {
      if (!shopifyCart) {
        if (quantity < 1) {
          setItems((prev) =>
            prev.filter((i) => i.product.id !== lineOrProductId)
          );
          return;
        }
        setItems((prev) =>
          prev.map((i) =>
            i.product.id === lineOrProductId ? { ...i, quantity } : i
          )
        );
        return;
      }

      const item = findItem(lineOrProductId);
      if (!item?.lineId || !cartId) return;

      (async () => {
        try {
          setCartError(null);
          const cart = await postCart(
            {
              action: "update",
              cartId,
              lineId: item.lineId,
              quantity,
            },
            locale
          );
          applyRemoteCart(cart);
        } catch (e) {
          setCartError(e instanceof Error ? e.message : "Greška");
        }
      })();
    },
    [shopifyCart, cartId, findItem, applyRemoteCart, locale]
  );

  const clearCart = useCallback(() => {
    if (!shopifyCart) {
      setItems([]);
      return;
    }
    localStorage.removeItem(CART_ID_KEY);
    setItems([]);
    setCartId(null);
    setCheckoutUrl(null);
    setSubtotal(0);
  }, [shopifyCart]);

  useEffect(() => {
    if (!toast?.visible) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const mockSubtotal = useMemo(
    () =>
      items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal: shopifyCart ? subtotal : mockSubtotal,
      checkoutUrl,
      isShopifyCart: shopifyCart,
      cartLoading,
      cartError,
      toast,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      dismissToast,
    }),
    [
      items,
      itemCount,
      shopifyCart,
      subtotal,
      mockSubtotal,
      checkoutUrl,
      cartLoading,
      cartError,
      toast,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      dismissToast,
    ]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
