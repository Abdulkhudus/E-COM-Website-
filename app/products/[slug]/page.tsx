// app/products/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuantitySelector from "./QuantitySelector";
import type { Product } from "@/app/api/products/[slug]/route";
import { fetchProductBySlug } from "@/app/api/products/[slug]/route";

// ─── Types ────────────────────────────────────────────────────────────────────

async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await fetchProductBySlug(slug);
  } catch (error) {
    throw new Error("Failed to fetch product");
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.name,
    description: product.description,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.price);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {/* ── Breadcrumb / back link ──────────────────────────────────────── */}
          <Link
            href="/products"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Back to Products
          </Link>

          {/* ── Product layout ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
            {/* ── Image ──────────────────────────────────────────────────── */}
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* ── Details ────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-6">
              {/* Category badge */}
              <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
                {product.category}
              </span>

              {/* Name */}
              <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl lg:text-4xl">
                {product.name}
              </h1>

              {/* Price */}
              <p className="text-3xl font-extrabold text-primary">
                {formattedPrice}
              </p>

              {/* Description */}
              <p className="leading-relaxed text-muted">
                {product.description}
              </p>

              {/* ── Divider ────────────────────────────────────────────── */}
              <hr className="border-border" />

              {/* ── Quantity + Add to Cart (client component) ──────────── */}
              <QuantitySelector productId={product.id} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
