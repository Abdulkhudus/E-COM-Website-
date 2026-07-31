import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductCardProps {
  /** Absolute URL or Next.js public-folder path for the product image. */
  image: string;
  /** Display name of the product. */
  name: string;
  /** Price in dollars (e.g. 29.99). Formatted to two decimal places. */
  price: number;
  /** URL-safe slug used to build the product detail link. */
  slug: string;
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

export default function ProductCard({ image, name, price, slug }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(price);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow duration-300 hover:shadow-md">

      {/* ── Product Image ──────────────────────────────────────────────── */}
      <Link
        href={`/products/${slug}`}
        aria-label={`View ${name}`}
        className="relative block aspect-square overflow-hidden bg-secondary"
        tabIndex={-1}
      >
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* ── Card Body ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-3 p-4">

        {/* Name */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {name}
        </h3>

        {/* Price */}
        <p className="text-lg font-bold text-primary">
          {formattedPrice}
        </p>

        {/* CTA */}
        <Link
          href={`/products/${slug}`}
          className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          View Product
          <ArrowRight size={15} strokeWidth={2.25} />
        </Link>

      </div>
    </article>
  );
}
