import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductCard, { ProductCardProps } from "@/components/ProductCard";
import Footer from "@/components/Footer";

// ─── Placeholder product data ─────────────────────────────────────────────────
// Images use picsum.photos with a fixed seed so they remain stable across reloads.
// Replace with real product data / API call once the backend is wired up.

const FEATURED_PRODUCTS: ProductCardProps[] = [
  {
    slug: "wireless-noise-cancelling-headphones",
    name: "Wireless Noise-Cancelling Headphones",
    price: 129.99,
    image: "https://picsum.photos/seed/headphones/600/600",
  },
  {
    slug: "minimalist-leather-watch",
    name: "Minimalist Leather Watch",
    price: 89.0,
    image: "https://picsum.photos/seed/watch/600/600",
  },
  {
    slug: "premium-running-shoes",
    name: "Premium Running Shoes",
    price: 149.95,
    image: "https://picsum.photos/seed/shoes/600/600",
  },
  {
    slug: "smart-portable-speaker",
    name: "Smart Portable Speaker",
    price: 74.99,
    image: "https://picsum.photos/seed/speaker/600/600",
  },
  {
    slug: "organic-cotton-tote-bag",
    name: "Organic Cotton Tote Bag",
    price: 24.0,
    image: "https://picsum.photos/seed/totebag/600/600",
  },
  {
    slug: "stainless-steel-water-bottle",
    name: "Stainless Steel Water Bottle",
    price: 39.99,
    image: "https://picsum.photos/seed/bottle/600/600",
  },
  {
    slug: "wireless-mechanical-keyboard",
    name: "Wireless Mechanical Keyboard",
    price: 199.0,
    image: "https://picsum.photos/seed/keyboard/600/600",
  },
  {
    slug: "ultraslim-laptop-stand",
    name: "Ultra-Slim Laptop Stand",
    price: 54.95,
    image: "https://picsum.photos/seed/laptopstand/600/600",
  },
];

// ─── Homepage ─────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Sticky top navigation */}
      <Navbar />

      {/* Full-width hero banner */}
      <Hero />

      {/* ── Featured Products ──────────────────────────────────────────────── */}
      <main id="products" className="flex-1">
        <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

          {/* Section heading */}
          <div className="mb-10 text-center sm:text-left">
            <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-primary">
              Hand-Picked For You
            </p>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
              Featured Products
            </h2>
            <p className="mt-2 max-w-lg text-sm text-muted sm:text-base">
              Explore our most popular picks — crafted for quality, priced for value.
            </p>
          </div>

          {/* Responsive product grid:
              1 col  → mobile
              2 cols → sm (640 px+)
              3 cols → lg (1024 px+)
              4 cols → xl (1280 px+)
          */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {FEATURED_PRODUCTS.map((product) => (
              <ProductCard key={product.slug} {...product} />
            ))}
          </div>

          {/* View all CTA */}
          <div className="mt-12 flex justify-center">
            <a
              href="/products"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-surface px-7 py-3 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:border-primary hover:text-primary"
            >
              View All Products
            </a>
          </div>
        </section>
      </main>

      {/* Site-wide footer */}
      <Footer />
    </div>
  );
}
