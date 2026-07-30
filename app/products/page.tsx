import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "./ProductFilters";
import type { Product } from "@/app/api/products/route";
import { PackageSearch } from "lucide-react";

// ─── Meta ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: "All Products | LiveWire",
  description: "Browse our full catalogue — search by name or filter by category.",
};

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getProducts(search?: string, category?: string): Promise<Product[]> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url  = new URL("/api/products", base);
  if (search)   url.searchParams.set("search",   search);
  if (category) url.searchParams.set("category", category);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  const json = await res.json();
  return json.products as Product[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ search?: string; category?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { search, category } = await searchParams;

  let products: Product[] = [];
  let fetchError = false;

  try {
    products = await getProducts(search, category);
  } catch {
    fetchError = true;
  }

  const activeCategory = category ?? "";
  const activeSearch   = search   ?? "";

  return (
    <div className="flex min-h-screen flex-col bg-background">

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── Page content ───────────────────────────────────────────────────── */}
      <main className="flex-1">
        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">

          {/* Page heading */}
          <div className="mb-8">
            <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-primary">
              Catalogue
            </p>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
              All Products
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
              Find exactly what you need — search by name or narrow down by category.
            </p>
          </div>

          {/* ── Search + filter bar ─────────────────────────────────────────── */}
          <div className="mb-8">
            <Suspense fallback={null}>
              <ProductFilters
                initialSearch={activeSearch}
                initialCategory={activeCategory}
              />
            </Suspense>
          </div>

          {/* ── Results ────────────────────────────────────────────────────── */}
          {fetchError ? (
            /* Error state */
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <PackageSearch size={48} className="text-muted opacity-50" />
              <p className="text-base font-semibold text-foreground">
                Something went wrong
              </p>
              <p className="max-w-xs text-sm text-muted">
                We couldn&apos;t load products right now. Please try again in a moment.
              </p>
            </div>
          ) : products.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <PackageSearch size={48} className="text-muted opacity-50" />
              <p className="text-base font-semibold text-foreground">
                No products found
              </p>
              <p className="max-w-xs text-sm text-muted">
                {activeSearch || activeCategory
                  ? "Try adjusting your search or clearing the category filter."
                  : "No products are available yet. Check back soon!"}
              </p>
            </div>
          ) : (
            <>
              {/* Result count */}
              <p className="mb-5 text-xs font-medium text-muted">
                {products.length} {products.length === 1 ? "product" : "products"} found
                {activeCategory && activeCategory !== "All"
                  ? ` in "${activeCategory}"`
                  : ""}
                {activeSearch ? ` for "${activeSearch}"` : ""}
              </p>

              {/* Responsive grid:
                  1 col  → mobile
                  2 cols → sm (640 px+)
                  3 cols → lg (1024 px+)
                  4 cols → xl (1280 px+)
              */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    image={product.image_url}
                    name={product.name}
                    price={product.price}
                    slug={product.slug}
                  />
                ))}
              </div>
            </>
          )}

        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
