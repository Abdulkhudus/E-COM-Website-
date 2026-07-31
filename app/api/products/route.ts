// app/api/products/route.ts
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
// This is the ONLY place that knows where products come from.
// Filtering is pushed down to Supabase so no unnecessary rows are fetched.

/**
 * Fetch products from the Supabase `products` table with optional filters.
 *
 * ?search=   → case-insensitive ILIKE match on the `name` column
 * ?category= → exact match on the `category` column
 */
export async function fetchProducts(search?: string, category?: string): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("id, name, description, price, image_url, category, slug");

  if (search) {
    // ilike is case-insensitive; % are wildcards
    query = query.ilike("name", `%${search}%`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Product[];
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search   = searchParams.get("search")   ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  try {
    const products = await fetchProducts(search, category);
    return NextResponse.json({ products }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 },
    );
  }
}
