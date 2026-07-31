// app/api/products/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  slug: string;
}

// ─── Data layer ───────────────────────────────────────────────────────────────
// This is the ONLY place that knows where a single product comes from.
// The GET handler below stays unchanged.

/**
 * Look up a single product by its slug from the Supabase `products` table.
 * Returns null (without throwing) when the slug doesn't match any row.
 */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, image_url, category, slug")
    .eq("slug", slug)
    .single();

  // PGRST116 = "The result contains 0 rows" — treat as not-found, not an error
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return data as Product;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const product = await fetchProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (err) {
    console.error(`[GET /api/products/${slug}]`, err);
    return NextResponse.json(
      { error: "Failed to fetch product." },
      { status: 500 },
    );
  }
}
