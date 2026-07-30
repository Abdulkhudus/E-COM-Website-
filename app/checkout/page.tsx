"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, AlertCircle, ShoppingBag, ArrowLeft, CheckCircle2 } from "lucide-react";

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

// ─── Checkout Page ────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, loading: cartLoading, subtotal } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ShippingForm>({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // If unauthenticated or cart empty (after loading), redirect or show message.
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const totalAmount = items.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;
    if (!user) return;
    if (items.length === 0) return;

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.uid,
          items: items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.product?.price ?? 0
          })),
          shipping_details: formData,
          total_amount: totalAmount,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Failed to place order.");
      }

      // Success, redirect to confirmation page
      // Note: Cart items were cleared on the backend.
      // Next time the user visits, useCart will re-fetch an empty cart.
      router.push(`/order-confirmation/${json.order_id}`);

    } catch (err: any) {
      console.error("Checkout submit error:", err);
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          
          {/* ── Shipping Form ────────────────────────────────────────────── */}
          <div className="lg:col-span-7 xl:col-span-8">
            <form id="checkout-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
                <h2 className="text-xl font-bold text-foreground mb-6">Shipping Address</h2>
                
                <div className="flex flex-col gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-sm font-semibold text-foreground">Full Name</label>
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
                    <label htmlFor="address" className="text-sm font-semibold text-foreground">Address</label>
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
                      <label htmlFor="city" className="text-sm font-semibold text-foreground">City</label>
                      <input
                        id="city"
                        type="text"
                        placeholder="New York"
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
                      <label htmlFor="postalCode" className="text-sm font-semibold text-foreground">Postal Code</label>
                      <input
                        id="postalCode"
                        type="text"
                        placeholder="10001"
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
                    <label htmlFor="phone" className="text-sm font-semibold text-foreground">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
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
              
              {submitError && (
                <div className="rounded-xl border border-error bg-error/10 p-4 flex items-start gap-3">
                  <AlertCircle size={20} className="text-error shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-error">{submitError}</p>
                </div>
              )}

            </form>
          </div>

          {/* ── Order Summary ────────────────────────────────────────────── */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>
              
              <ul className="flex flex-col gap-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
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
                          ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                              item.product.price * item.quantity
                            )
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
                
                <button
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
                  {isSubmitting ? "Processing…" : "Place Order"}
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
