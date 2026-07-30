import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Package, Truck, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getOrder(orderId: string) {
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !order) return null;
  return order;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(order.total_amount);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex flex-1 items-center justify-center p-4 py-12 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-10 text-center">
          
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success mb-6">
            <CheckCircle size={40} strokeWidth={2.5} />
          </div>

          <h1 className="text-3xl font-bold text-foreground">Order Confirmed!</h1>
          <p className="mt-3 text-base text-muted max-w-md mx-auto">
            Thank you for shopping with LiveWire. We&apos;ve received your order and are getting it ready to ship.
          </p>

          <div className="mt-10 rounded-2xl border border-border bg-background p-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 mb-4 gap-4">
              <div>
                <p className="text-sm font-semibold text-muted">Order ID</p>
                <p className="text-sm font-mono font-bold text-foreground mt-0.5">{order.id}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-sm font-semibold text-muted">Status</p>
                <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-secondary-foreground">
                  <Package size={12} strokeWidth={2.5} />
                  {order.status}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                  <Truck size={16} className="text-primary" />
                  Shipping To
                </p>
                {order.shipping_details ? (
                  <address className="not-italic text-sm text-muted leading-relaxed">
                    <span className="block font-medium text-foreground">{order.shipping_details.name}</span>
                    {order.shipping_details.address}<br />
                    {order.shipping_details.city}, {order.shipping_details.postalCode}<br />
                    {order.shipping_details.phone}
                  </address>
                ) : (
                  <p className="text-sm text-muted">No shipping details provided.</p>
                )}
              </div>
              <div className="sm:text-right flex flex-col justify-end">
                <p className="text-sm font-semibold text-muted mb-1">Total Amount Paid</p>
                <p className="text-3xl font-extrabold text-primary">{formattedTotal}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90"
            >
              Continue Shopping
              <ArrowRight size={18} strokeWidth={2} />
            </Link>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
