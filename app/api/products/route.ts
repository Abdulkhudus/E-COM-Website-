// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";

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
// To swap to Supabase, replace `fetchProducts` with a Supabase query —
// the GET handler below stays unchanged.

const IN_MEMORY_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Wireless Noise-Cancelling Headphones",
    description:
      "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and studio-quality sound.",
    price: 149.99,
    image_url: "https://picsum.photos/seed/headphones/600/600",
    category: "Audio",
    slug: "wireless-noise-cancelling-headphones",
  },
  {
    id: "2",
    name: "Mechanical Keyboard — TKL",
    description:
      "Tenkeyless mechanical keyboard with hot-swappable switches, RGB backlighting, and an aircraft-grade aluminium frame.",
    price: 119.99,
    image_url: "https://picsum.photos/seed/keyboard/600/600",
    category: "Peripherals",
    slug: "mechanical-keyboard-tkl",
  },
  {
    id: "3",
    name: "4K Ultra-Wide Monitor 34\"",
    description:
      "Curved 34-inch IPS display with 144 Hz refresh rate, HDR400, and USB-C 65 W charging built in.",
    price: 499.99,
    image_url: "https://picsum.photos/seed/monitor/600/600",
    category: "Displays",
    slug: "4k-ultrawide-monitor-34",
  },
  {
    id: "4",
    name: "Ergonomic Mesh Office Chair",
    description:
      "Fully adjustable lumbar support, breathable mesh back, and 5-year warranty. Ideal for long work sessions.",
    price: 329.00,
    image_url: "https://picsum.photos/seed/chair/600/600",
    category: "Furniture",
    slug: "ergonomic-mesh-office-chair",
  },
  {
    id: "5",
    name: "Portable SSD — 1 TB",
    description:
      "USB 3.2 Gen 2 external SSD with read speeds up to 1 050 MB/s. Drop-resistant and pocket-sized.",
    price: 89.99,
    image_url: "https://picsum.photos/seed/ssd/600/600",
    category: "Storage",
    slug: "portable-ssd-1tb",
  },
  {
    id: "6",
    name: "Smart LED Desk Lamp",
    description:
      "Touch-controlled lamp with 5 colour temperatures, wireless charging base, and USB-A output port.",
    price: 54.99,
    image_url: "https://picsum.photos/seed/lamp/600/600",
    category: "Accessories",
    slug: "smart-led-desk-lamp",
  },
  {
    id: "7",
    name: "Wireless Charging Pad",
    description:
      "Qi-certified 15 W fast-charging pad compatible with iPhone, Android, and AirPods. Slim, mat-finish design.",
    price: 34.99,
    image_url: "https://picsum.photos/seed/charger/600/600",
    category: "Accessories",
    slug: "wireless-charging-pad",
  },
  {
    id: "8",
    name: "USB-C Hub — 9-in-1",
    description:
      "Expands your laptop with 4K HDMI, 100 W PD, SD/microSD slots, 3× USB-A 3.0, and Gigabit Ethernet.",
    price: 69.99,
    image_url: "https://picsum.photos/seed/hub/600/600",
    category: "Peripherals",
    slug: "usb-c-hub-9-in-1",
  },
];

/**
 * Fetch and optionally filter the product list.
 *
 * ─── Supabase swap ───────────────────────────────────────────────────────────
 * Replace the body of this function with a Supabase call, e.g.:
 *
 *   const query = supabase.from("products").select("*");
 *   if (search)   query.ilike("name", `%${search}%`);
 *   if (category) query.eq("category", category);
 *   const { data, error } = await query;
 *   if (error) throw error;
 *   return data as Product[];
 * ─────────────────────────────────────────────────────────────────────────────
 */
async function fetchProducts(search?: string, category?: string): Promise<Product[]> {
  let results = IN_MEMORY_PRODUCTS;

  if (search) {
    const term = search.toLowerCase();
    results = results.filter((p) => p.name.toLowerCase().includes(term));
  }

  if (category) {
    const cat = category.toLowerCase();
    results = results.filter((p) => p.category.toLowerCase() === cat);
  }

  return results;
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
