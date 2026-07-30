// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

// ─── POST /api/orders ─────────────────────────────────────────────────────────
// Creates a new order from cart items, inserts order_items, and clears the cart.
// Body (JSON): { user_id, items, shipping_details, total_amount }

export async function POST(request: NextRequest) {
  let body;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body.", 400);
  }

  const { user_id, items, shipping_details, total_amount } = body;

  if (!user_id) {
    return errorResponse("Missing required field: user_id", 400);
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return errorResponse("Order must contain at least one item.", 400);
  }

  // 1) Insert a new row into orders
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id,
      status: "pending",
      total_amount,
      shipping_details, // Storing as JSONB or a structured object
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("[POST /api/orders] Order creation failed:", orderError);
    return errorResponse("Failed to create order.", 500);
  }

  const orderId = order.id;

  // 2) Insert matching rows into order_items
  const orderItemsData = items.map((item: any) => ({
    order_id: orderId,
    product_id: item.product_id,
    quantity: item.quantity,
    // Typically it's good to record the price at the time of purchase
    price: item.price ?? item.product?.price ?? 0,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsData);

  if (itemsError) {
    console.error("[POST /api/orders] Order items creation failed:", itemsError);
    // Ideally we would roll back the order creation here, but standard Supabase 
    // REST doesn't support multi-statement transactions. We log and return 500.
    return errorResponse("Failed to add items to order.", 500);
  }

  // 3) Clear the user's cart_items rows
  const { error: clearError } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user_id);

  if (clearError) {
    // Non-fatal to the order, but we should log it
    console.error("[POST /api/orders] Failed to clear cart:", clearError);
  }

  // 4) Return the new order's id
  return successResponse({ order_id: orderId }, 201);
}
