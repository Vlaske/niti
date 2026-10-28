"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  stepQuantity: (lineOrProductId: string, delta: number) => void;
  clearCart: () => void;
  dismissToast: () => void;
  /** Resolves once in-flight quantity edits have reached Shopify. */
  prepareCheckout: () => Promise<string | null>;
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
  const cartRevision = useRef(0);
  const lineJobs = useRef(
    new Map<string, { desired: number; inflight: boolean }>()
  );
  const syncWaiters = useRef<Array<() => void>>([]);
  const checkoutUrlRef = useRef<string | null>(null);
  checkoutUrlRef.current = checkoutUrl;

  const settleSync = useCallback(() => {
    if (lineJobs.current.size > 0) return;
    const waiters = syncWaiters.current.splice(0);
    for (const wait of waiters) wait();
  }, []);

  const flushLineRef = useRef<(lineId: string, id: string) => void>(() => {});
  flushLineRef.current = (lineId, id) => {
    const job = lineJobs.current.get(lineId);
    if (!job || job.inflight) return;
    const quantity = job.desired;
    job.inflight = true;
    cartRevision.current += 1;
    const revision = cartRevision.current;

    void (async () => {
      try {
        setCartError(null);
        const cart =
          quantity < 1
            ? await postCart({ action: "remove", cartId: id, lineId }, locale)
            : await postCart(
                { action: "update", cartId: id, lineId, quantity },
                locale
              );
        const current = lineJobs.current.get(lineId);
        if (!current) {
          settleSync();
          return;
        }
        current.inflight = false;
        if (current.desired !== quantity) {
          flushLineRef.current(lineId, id);
          return;
        }
        lineJobs.current.delete(lineId);
        if (revision === cartRevision.current) {
          applyRemoteCart(cart);
        }
        settleSync();
      } catch (e) {
        lineJobs.current.delete(lineId);
        setCartError(e instanceof Error ? e.message : "Greška");
        try {
          const fresh = await fetchCart(id, locale);
          if (fresh && revision === cartRevision.current) {
            applyRemoteCart(fresh);
          }
        } catch {
          /* cartError already set */
        }
        settleSync();
      }
    })();
  };

  const dismissToast = useCallback(() => setToast(null), []);

  const applyRemoteCart = useCallback((cart: CartApiState) => {
    setItems(cart.items);
    setCartId(cart.cartId);
    setCheckoutUrl(cart.checkoutUrl);
    setSubtotal(cart.subtotal);
    localStorage.setItem(CART_ID_KEY, cart.cartId);
  }, []);

  const ensureCartId = useCallback(async (): Promise<string> => {
    if (cartId) return cartId;
    const stored = localStorage.getItem(CART_ID_KEY);
    if (stored) {
      setCartId(stored);
      return stored;
    }
    const created = await postCart({ action: "create" }, locale);
    setCartId(created.cartId);
    setCheckoutUrl(created.checkoutUrl);
    localStorage.setItem(CART_ID_KEY, created.cartId);
    return created.cartId;
  }, [cartId, locale]);

  useEffect(() => {
    if (!shopifyCart) {
      setCartLoading(false);
      return;
    }

    let cancelled = false;
    const revision = cartRevision.current;

    (async () => {
      try {
        const stored = localStorage.getItem(CART_ID_KEY);
        if (stored) {
          const cart = await fetchCart(stored, locale);
          if (
            !cancelled &&
            cart &&
            revision === cartRevision.current
          ) {
            applyRemoteCart(cart);
            return;
          }
          if (!cancelled && revision === cartRevision.current) {
            localStorage.removeItem(CART_ID_KEY);
          }
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

  const applyOptimisticAdd = useCallback(
    (
      product: Product,
      quantity: number,
      selectedColor?: string
    ): CartItem[] => {
      let nextItems: CartItem[] = [];
      setItems((prev) => {
        const existing = prev.find(
          (i) =>
            i.product.id === product.id && i.selectedColor === selectedColor
        );
        nextItems = existing
          ? prev.map((i) =>
              i.product.id === product.id &&
              i.selectedColor === selectedColor
                ? { ...i, quantity: i.quantity + quantity }
                : i
            )
          : [...prev, { product, quantity, selectedColor }];
        return nextItems;
      });
      setSubtotal(
        nextItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
      );
      return nextItems;
    },
    []
  );

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
        applyOptimisticAdd(product, quantity, selectedColor);
        setToast({ product, variant: "success", visible: true });
        return;
      }

      const previousItems = items;
      const previousSubtotal = subtotal;
      cartRevision.current += 1;
      const revision = cartRevision.current;
      applyOptimisticAdd(product, quantity, selectedColor);

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
          if (revision !== cartRevision.current) return;
          applyRemoteCart(cart);
          setToast({ product, variant: "success", visible: true });
        } catch (e) {
          if (revision !== cartRevision.current) return;
          setItems(previousItems);
          setSubtotal(previousSubtotal);
          const message = e instanceof Error ? e.message : "Greška";
          setCartError(message);
          showErrorToast(message);
        }
      })();
    },
    [
      shopifyCart,
      cartId,
      items,
      subtotal,
      ensureCartId,
      applyRemoteCart,
      applyOptimisticAdd,
      showErrorToast,
      locale,
    ]
  );

  const stepQuantity = useCallback(
    (lineOrProductId: string, delta: number) => {
      const item = findItem(lineOrProductId);
      const pending = item?.lineId
        ? lineJobs.current.get(item.lineId)?.desired
        : undefined;
      const base = pending ?? item?.quantity ?? 0;
      updateQuantityRef.current(lineOrProductId, base + delta);
    },
    [findItem]
  );

  const updateQuantityRef = useRef<
    (lineOrProductId: string, quantity: number) => void
  >(() => {});

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

      const lineId = item.lineId;
      const price = item.product.price;
      const previousQty =
        lineJobs.current.get(lineId)?.desired ?? item.quantity;

      setItems((prev) =>
        quantity < 1
          ? prev.filter((i) => i.lineId !== lineId)
          : prev.map((i) => (i.lineId === lineId ? { ...i, quantity } : i))
      );
      setSubtotal((prev) =>
        quantity < 1
          ? Math.max(0, prev - price * previousQty)
          : prev - price * previousQty + price * quantity
      );

      const job = lineJobs.current.get(lineId) ?? {
        desired: quantity,
        inflight: false,
      };
      job.desired = quantity;
      lineJobs.current.set(lineId, job);
      flushLineRef.current(lineId, cartId);
    },
    [shopifyCart, cartId, findItem]
  );
  updateQuantityRef.current = updateQuantity;

  const removeItem = useCallback(
    (lineOrProductId: string) => {
      if (!shopifyCart) {
        setItems((prev) =>
          prev.filter((i) => i.product.id !== lineOrProductId)
        );
        return;
      }
      updateQuantity(lineOrProductId, 0);
    },
    [shopifyCart, updateQuantity]
  );

  const prepareCheckout = useCallback(() => {
    if (lineJobs.current.size === 0) {
      return Promise.resolve(checkoutUrlRef.current);
    }
    return new Promise<string | null>((resolve) => {
      syncWaiters.current.push(() => resolve(checkoutUrlRef.current));
    });
  }, []);

  const clearCart = useCallback(() => {
    if (!shopifyCart) {
      setItems([]);
      return;
    }
    localStorage.removeItem(CART_ID_KEY);
    lineJobs.current.clear();
    cartRevision.current += 1;
    setItems([]);
    setCartId(null);
    setCheckoutUrl(null);
    setSubtotal(0);
    const waiters = syncWaiters.current.splice(0);
    for (const wait of waiters) wait();
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
      stepQuantity,
      clearCart,
      dismissToast,
      prepareCheckout,
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
      stepQuantity,
      clearCart,
      dismissToast,
      prepareCheckout,
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
