// app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Standardised error response shape. */
function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

/** Standardised success response shape. */
function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

// ─── GET /api/cart?user_id=<uid> ──────────────────────────────────────────────
// Returns all cart_items rows that belong to the given user.
// NOTE: user_id is currently a plain query param. Once session auth is wired
// up, replace `user_id` here with the verified UID from the session token.

export async function GET(request: NextRequest) {
  const user_id = request.nextUrl.searchParams.get("user_id");

  if (!user_id) {
    return errorResponse("Missing required query param: user_id", 400);
  }

  const { data, error } = await supabase
    .from("cart_items")
    .select("id, user_id, product_id, quantity, created_at")
    .eq("user_id", user_id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[GET /api/cart]", error);
    return errorResponse("Failed to fetch cart items.", 500);
  }

  return successResponse({ items: data as CartItem[] });
}

// ─── POST /api/cart ───────────────────────────────────────────────────────────
// Inserts a new cart_items row.
// Body (JSON): { user_id, product_id, quantity }

export async function POST(request: NextRequest) {
  let body: Partial<CartItem>;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body.", 400);
  }

  const { user_id, product_id, quantity } = body;

  if (!user_id || !product_id) {
    return errorResponse("Missing required fields: user_id, product_id", 400);
  }

  const qty = typeof quantity === "number" && quantity > 0 ? quantity : 1;

  const { data, error } = await supabase
    .from("cart_items")
    .insert({ user_id, product_id, quantity: qty })
    .select("id, user_id, product_id, quantity, created_at")
    .single();

  if (error) {
    console.error("[POST /api/cart]", error);
    return errorResponse("Failed to add item to cart.", 500);
  }

  return successResponse({ item: data as CartItem }, 201);
}

// ─── PATCH /api/cart ──────────────────────────────────────────────────────────
// Updates the quantity of an existing cart_items row.
// Body (JSON): { id, quantity }

export async function PATCH(request: NextRequest) {
  let body: Partial<CartItem & { id: string }>;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body.", 400);
  }

  const { id, quantity } = body;

  if (!id) {
    return errorResponse("Missing required field: id", 400);
  }

  if (typeof quantity !== "number" || quantity < 1) {
    return errorResponse("quantity must be a positive integer.", 400);
  }

  const { data, error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", id)
    .select("id, user_id, product_id, quantity, created_at")
    .single();

  if (error) {
    // PGRST116 = row not found
    if (error.code === "PGRST116") {
      return errorResponse(`Cart item with id "${id}" not found.`, 404);
    }
    console.error("[PATCH /api/cart]", error);
    return errorResponse("Failed to update cart item.", 500);
  }

  return successResponse({ item: data as CartItem });
}

// ─── DELETE /api/cart ─────────────────────────────────────────────────────────
// Removes a cart_items row by id.
// Body (JSON): { id }

export async function DELETE(request: NextRequest) {
  let body: { id?: string };

  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body.", 400);
  }

  const { id } = body;

  if (!id) {
    return errorResponse("Missing required field: id", 400);
  }

  const { error, count } = await supabase
    .from("cart_items")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    console.error("[DELETE /api/cart]", error);
    return errorResponse("Failed to remove cart item.", 500);
  }

  if (count === 0) {
    return errorResponse(`Cart item with id "${id}" not found.`, 404);
  }

  return successResponse({ deleted_id: id });
}
