"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Loader2,
  AlertCircle,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

// ─── Razorpay global type ─────────────────────────────────────────────────────
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open(): void;
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShippingForm {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
}

/** Everything we need to reopen the Razorpay popup for the same order. */
interface PendingRzpOrder {
  supabaseOrderId: string;
  razorpayOrderId: string;
  amount: number; // in paise
}

/**
 * Granular payment state drives which panel the user sees in the right column.
 *
 *  idle       – normal form (initial state)
 *  submitting – creating Supabase + Razorpay orders (spinner on button)
 *  opening    – Razorpay SDK loading / popup open (full-screen overlay)
 *  verifying  – server-side HMAC check in progress (overlay stays up)
 *  success    – payment verified; brief screen before redirect
 *  cancelled  – user dismissed popup (order stays pending)
 *  failed     – verification call returned an error
 */
type PaymentState =
  | "idle"
  | "submitting"
  | "opening"
  | "verifying"
  | "success"
  | "cancelled"
  | "failed";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK."));
    document.head.appendChild(script);
  });
}

// ─── Checkout Page ────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, loading: cartLoading, subtotalNum, subtotal } = useCart();

  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Stored after the Razorpay order is created so we can reopen the popup
   * for the same order without hitting /api/orders or /api/create-razorpay-order
   * again. Kept as a ref so the Razorpay handler closure always reads the
   * latest value without needing it as a dependency.
   */
  const pendingRzpRef = useRef<PendingRzpOrder | null>(null);

  const [formData, setFormData] = useState<ShippingForm>({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!authLoading && !user) router.push("/");
  }, [user, authLoading, router]);

  // Use the CartContext's computed subtotal as the single source of truth.
  // (item.product may be undefined if enrichment silently failed, causing a
  // recompute here to produce 0 — which Razorpay rejects.)
  const totalAmount = subtotalNum;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";
    if (!formData.city.trim()) newErrors.city = "City is required.";
    if (!formData.postalCode.trim()) newErrors.postalCode = "Postal code is required.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Core: open (or reopen) the Razorpay popup ─────────────────────────────
  // Extracted so both the initial submit and the "Try Again" button use the
  // exact same logic.
  const openRazorpayPopup = useCallback(
    async (pending: PendingRzpOrder) => {
      if (!user) return;

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!keyId) {
        setSubmitError("Razorpay key is not configured.");
        setPaymentState("failed");
        return;
      }

      setPaymentState("opening");
      setSubmitError(null);

      try {
        await loadRazorpayScript();
      } catch {
        setSubmitError("Could not load the payment SDK. Please refresh and try again.");
        setPaymentState("failed");
        return;
      }

      const options: RazorpayOptions = {
        key: keyId,
        amount: pending.amount,
        currency: "INR",
        name: "ShopVerse",
        description: "Secure checkout powered by Razorpay",
        image: "/logo.png",
        order_id: pending.razorpayOrderId,
        prefill: {
          name: formData.name,
          email: user.email ?? undefined,
          contact: formData.phone,
        },
        theme: { color: "#6C47FF" },

        // ── Payment success handler ──────────────────────────────────────────
        handler: async (response: RazorpayPaymentResponse) => {
          setPaymentState("verifying");

          try {
            const verifyRes = await fetch("/api/verify-razorpay-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyJson = await verifyRes.json();

            if (!verifyRes.ok || !verifyJson.success) {
              setSubmitError(verifyJson.error || "Payment verification failed.");
              setPaymentState("failed");
              return;
            }

            // ── SUCCESS ───────────────────────────────────────────────────────
            setPaymentState("success");
            // Brief pause so the success screen is visible, then redirect.
            setTimeout(() => {
              router.push(`/order-confirmation/${pending.supabaseOrderId}`);
            }, 1800);
          } catch (err: any) {
            setSubmitError(err.message || "An unexpected error occurred during verification.");
            setPaymentState("failed");
          }
        },

        // ── Popup dismissed without paying ────────────────────────────────────
        modal: {
          ondismiss: async () => {
            // Confirm the order is still pending via /api/order-status/[id]
            // before showing the "try again" banner (not modifying that file).
            try {
              const statusRes = await fetch(
                `/api/order-status/${pending.supabaseOrderId}`
              );
              const statusJson = await statusRes.json();

              if (statusJson.status === "paid") {
                // Edge case: payment went through but handler wasn't called.
                setPaymentState("success");
                setTimeout(() => {
                  router.push(`/order-confirmation/${pending.supabaseOrderId}`);
                }, 1800);
                return;
              }
            } catch {
              // Non-fatal — fall through to show the cancelled state.
            }

            setPaymentState("cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    },
    [user, formData.name, formData.phone, router]
  );

  // ── Primary submit: create orders, then open popup ────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;
    if (!user) return;
    if (items.length === 0) return;
    if (totalAmount <= 0) {
      setSubmitError("Cart total could not be calculated. Please refresh and try again.");
      return;
    }

    setPaymentState("submitting");

    try {
      // Step 1: Create Supabase order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.uid,
          items: items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.product?.price ?? 0,
          })),
          shipping_details: formData,
          total_amount: totalAmount,
        }),
      });

      const orderJson = await orderRes.json();
      if (!orderJson.success) {
        throw new Error(orderJson.error || "Failed to place order.");
      }

      const supabaseOrderId: string = orderJson.order_id;

      // Step 2: Create Razorpay order
      const rzpOrderRes = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: supabaseOrderId }),
      });

      const rzpOrderJson = await rzpOrderRes.json();
      if (!rzpOrderRes.ok || rzpOrderJson.error) {
        throw new Error(rzpOrderJson.error || "Failed to create Razorpay order.");
      }

      const pending: PendingRzpOrder = {
        supabaseOrderId,
        razorpayOrderId: rzpOrderJson.razorpay_order_id,
        amount: rzpOrderJson.amount,
      };

      // Persist for retry without re-creating orders
      pendingRzpRef.current = pending;

      // Step 3: Open the popup
      await openRazorpayPopup(pending);
    } catch (err: any) {
      console.error("Checkout error:", err);
      setSubmitError(err.message || "An unexpected error occurred.");
      setPaymentState("idle");
    }
  };

  // ── "Try Again" — reopen popup for the same order ────────────────────────
  const handleRetry = async () => {
    const pending = pendingRzpRef.current;
    if (!pending) return;
    await openRazorpayPopup(pending);
  };

  // ── Derived booleans ──────────────────────────────────────────────────────
  const isSubmitting = paymentState === "submitting";
  const isOpeningOrVerifying =
    paymentState === "opening" || paymentState === "verifying";

  // ── Loading & empty states ─────────────────────────────────────────────────

  if (authLoading || cartLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 size={40} className="animate-spin text-muted" />
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <ShoppingBag size={56} className="text-muted opacity-40" />
          <h1 className="text-2xl font-bold text-foreground">Your cart is empty</h1>
          <p className="text-muted">You have no items in your cart to checkout.</p>
          <Link
            href="/products"
            className="mt-4 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
          >
            Continue Shopping
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* ── Full-screen overlay: SDK loading / popup open / verifying ──────── */}
      {isOpeningOrVerifying && (
        <div
          role="status"
          aria-live="polite"
          aria-label={
            paymentState === "verifying"
              ? "Verifying payment"
              : "Opening payment checkout"
          }
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-foreground/40 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-surface px-10 py-8 shadow-2xl">
            <Loader2 size={36} className="animate-spin text-primary" />
            <p className="text-base font-semibold text-foreground">
              {paymentState === "verifying"
                ? "Verifying your payment…"
                : "Opening secure payment…"}
            </p>
            <p className="text-sm text-muted">Please do not close this window.</p>
          </div>
        </div>
      )}

      {/* ── Full-screen success screen ─────────────────────────────────────── */}
      {paymentState === "success" && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Payment successful"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
        >
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-surface border border-border px-12 py-12 shadow-2xl text-center max-w-sm mx-4">
            {/* Animated ring + icon */}
            <div className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-20 w-20 rounded-full bg-success/20 animate-ping" />
              <CheckCircle2
                size={64}
                className="relative text-success"
                strokeWidth={1.75}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Payment Successful!</h2>
              <p className="mt-2 text-sm text-muted">
                Your order has been confirmed. Redirecting you now…
              </p>
            </div>
            <Loader2 size={20} className="animate-spin text-muted" />
          </div>
        </div>
      )}

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Link
          href="/cart"
          onClick={(e) => {
            e.preventDefault();
            router.back();
          }}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Back to Cart
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
          <p className="mt-1 text-sm text-muted">Complete your order details below.</p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">

          {/* ── Shipping Form ──────────────────────────────────────────────── */}
          <div className="lg:col-span-7 xl:col-span-8">
            <form id="checkout-form" onSubmit={handleSubmit} className="flex flex-col gap-6">

              <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
                <h2 className="text-xl font-bold text-foreground mb-6">Shipping Address</h2>

                <div className="flex flex-col gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-sm font-semibold text-foreground">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.name ? "border-error focus:border-error" : "border-border focus:border-primary"
                      }`}
                    />
                    {errors.name && (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-error mt-1">
                        <AlertCircle size={14} /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="address" className="text-sm font-semibold text-foreground">
                      Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      placeholder="123 Main St"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.address ? "border-error focus:border-error" : "border-border focus:border-primary"
                      }`}
                    />
                    {errors.address && (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-error mt-1">
                        <AlertCircle size={14} /> {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* City */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="city" className="text-sm font-semibold text-foreground">
                        City
                      </label>
                      <input
                        id="city"
                        type="text"
                        placeholder="Mumbai"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                          errors.city ? "border-error focus:border-error" : "border-border focus:border-primary"
                        }`}
                      />
                      {errors.city && (
                        <p className="flex items-center gap-1.5 text-xs font-medium text-error mt-1">
                          <AlertCircle size={14} /> {errors.city}
                        </p>
                      )}
                    </div>

                    {/* Postal Code */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="postalCode" className="text-sm font-semibold text-foreground">
                        Postal Code
                      </label>
                      <input
                        id="postalCode"
                        type="text"
                        placeholder="400001"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                          errors.postalCode ? "border-error focus:border-error" : "border-border focus:border-primary"
                        }`}
                      />
                      {errors.postalCode && (
                        <p className="flex items-center gap-1.5 text-xs font-medium text-error mt-1">
                          <AlertCircle size={14} /> {errors.postalCode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="text-sm font-semibold text-foreground">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.phone ? "border-error focus:border-error" : "border-border focus:border-primary"
                      }`}
                    />
                    {errors.phone && (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-error mt-1">
                        <AlertCircle size={14} /> {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Generic submit error (order creation stage only) */}
              {paymentState === "idle" && submitError && (
                <div className="rounded-xl border border-error bg-error/10 p-4 flex items-start gap-3">
                  <AlertCircle size={20} className="text-error shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-error">{submitError}</p>
                </div>
              )}

            </form>
          </div>

          {/* ── Order Summary + Payment Status Panel ────────────────────────── */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>

              <ul className="flex flex-col gap-4 mb-6 max-h-[260px] sm:max-h-[400px] overflow-y-auto pr-1 -mr-1">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary border border-border">
                      {item.product?.image_url && (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name ?? "Product"}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-surface shadow-sm">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                        {item.product?.name ?? item.product_id}
                      </p>
                      <p className="text-sm font-bold text-primary mt-1">
                        {item.product
                          ? new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                            }).format(item.product.price * item.quantity)
                          : "—"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-base font-semibold text-foreground">Total</span>
                  <span className="text-xl font-extrabold text-foreground">{subtotal}</span>
                </div>

                {/* ── CANCELLED: user dismissed the popup ─────────────────── */}
                {paymentState === "cancelled" && (
                  <div className="mb-4 rounded-xl border border-border bg-secondary/60 p-4 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <XCircle
                        size={20}
                        className="text-muted shrink-0 mt-0.5"
                        strokeWidth={2}
                      />
                      <p className="text-sm font-medium text-foreground">
                        Payment was not completed. You can try again.
                      </p>
                    </div>
                    <button
                      id="retry-payment-btn"
                      onClick={handleRetry}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                    >
                      <RefreshCw size={16} strokeWidth={2.25} />
                      Retry Payment
                    </button>
                  </div>
                )}

                {/* ── FAILED: server-side verification returned an error ────── */}
                {paymentState === "failed" && (
                  <div className="mb-4 rounded-xl border border-error bg-error/10 p-4 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <XCircle
                        size={20}
                        className="text-error shrink-0 mt-0.5"
                        strokeWidth={2}
                      />
                      <div>
                        <p className="text-sm font-semibold text-error">
                          Payment verification failed.
                        </p>
                        {submitError && (
                          <p className="mt-0.5 text-xs text-error/80">{submitError}</p>
                        )}
                      </div>
                    </div>
                    {/* Only show retry if we still have the pending order */}
                    {pendingRzpRef.current && (
                      <button
                        id="retry-after-failure-btn"
                        onClick={handleRetry}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-error bg-transparent py-3 text-sm font-semibold text-error transition-all duration-200 hover:bg-error/10 active:scale-[0.98]"
                      >
                        <RefreshCw size={16} strokeWidth={2.25} />
                        Try Again
                      </button>
                    )}
                  </div>
                )}

                {/* ── Default Pay Now button ────────────────────────────────── */}
                {(paymentState === "idle" || paymentState === "submitting") && (
                  <button
                    id="pay-now-btn"
                    type="submit"
                    form="checkout-form"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:opacity-90 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={20} strokeWidth={2.25} />
                    )}
                    {isSubmitting ? "Preparing order…" : "Pay Now"}
                  </button>
                )}

                <p className="mt-3 text-center text-xs text-muted">
                  Secured by{" "}
                  <span className="font-semibold text-foreground">Razorpay</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
