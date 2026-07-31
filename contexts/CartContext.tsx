"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  /** Joined product fields — populated by enrichItems() after fetch */
  product?: {
    name: string;
    price: number;
    image_url: string;
    slug: string;
  };
}

interface CartContextValue {
  items: CartItem[];
  loading: boolean;
  /** Total individual units across all cart items */
  itemCount: number;
  /** Raw numeric subtotal (in rupees) */
  subtotalNum: number;
  /** Pre-formatted subtotal string, e.g. "₹129.97" */
  subtotal: string;
  /** Cart drawer visibility */
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Track which UID we last fetched for — avoid duplicate fetches
  const fetchedFor = useRef<string | null>(null);
  // Cache product detail lookups across renders
  const productCache = useRef<Map<string, CartItem["product"]>>(new Map());

  // ── Enrich items with product data ──────────────────────────────────────────
  const enrichItems = useCallback(async (raw: CartItem[]): Promise<CartItem[]> => {
    const uniqueIds = [...new Set(raw.map((i) => i.product_id))];
    await Promise.all(
      uniqueIds.map(async (pid) => {
        if (productCache.current.has(pid)) return;
        try {
          const res = await fetch(`/api/products/${pid}`);
          const json = await res.json();
          if (json.product) {
            productCache.current.set(pid, {
              name:      json.product.name,
              price:     json.product.price,
              image_url: json.product.image_url,
              slug:      json.product.slug,
            });
          }
        } catch { /* skip enrichment silently on network error */ }
      })
    );
    return raw.map((item) => ({
      ...item,
      product: productCache.current.get(item.product_id),
    }));
  }, []);

  // ── Fetch cart from API ──────────────────────────────────────────────────────
  const fetchCart = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/cart?user_id=${encodeURIComponent(uid)}`);
      const json = await res.json();
      if (json.success) {
        const enriched = await enrichItems(json.items as CartItem[]);
        setItems(enriched);
      }
    } catch (err) {
      console.error("[CartContext] fetchCart:", err);
    } finally {
      setLoading(false);
    }
  }, [enrichItems]);

  // Re-fetch when the signed-in user changes
  useEffect(() => {
    if (!user) {
      setItems([]);
      fetchedFor.current = null;
      return;
    }
    if (fetchedFor.current === user.uid) return;
    fetchedFor.current = user.uid;
    fetchCart(user.uid);
  }, [user, fetchCart]);

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      if (!user) throw new Error("not-signed-in");

      const existingItem = items.find((i) => i.product_id === productId);
      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
        return;
      }

      const res  = await fetch("/api/cart", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ user_id: user.uid, product_id: productId, quantity }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to add item");
      const [enriched] = await enrichItems([json.item as CartItem]);
      setItems((prev) => [...prev, enriched]);
    },
    [user, enrichItems, items, updateQuantity]
  );

  // ── updateQuantity ───────────────────────────────────────────────────────────
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    const res  = await fetch("/api/cart", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id: itemId, quantity }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? "Failed to update quantity");
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: json.item.quantity } : item
      )
    );
  }, []);

  // ── removeFromCart ───────────────────────────────────────────────────────────
  const removeFromCart = useCallback(async (itemId: string) => {
    const res  = await fetch("/api/cart", {
      method:  "DELETE",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id: itemId }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? "Failed to remove item");
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  // ── Derived values ───────────────────────────────────────────────────────────
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const subtotalNum = items.reduce(
    (sum, i) => sum + (i.product?.price ?? 0) * i.quantity,
    0
  );
  const subtotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(subtotalNum);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        itemCount,
        subtotalNum,
        subtotal,
        drawerOpen,
        openDrawer:     () => setDrawerOpen(true),
        closeDrawer:    () => setDrawerOpen(false),
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
