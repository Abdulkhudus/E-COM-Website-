// app/api/order-status/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/order-status/[id]
 *
 * Returns the current status of an order by its UUID.
 * Used by the frontend to re-check / retry payment verification.
 *
 * Response shape (200):
 *   { success: true, id, status, razorpay_order_id, razorpay_payment_id, total_amount, created_at }
 *
 * Error responses:
 *   400  – id param is missing or empty
 *   404  – no order found with that id
 *   500  – unexpected database error
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // ── 1. Validate the param ────────────────────────────────────────────────────
  if (!id || id.trim() === "") {
    return NextResponse.json(
      { success: false, error: "Order id is required." },
      { status: 400 }
    );
  }

  // ── 2. Query Supabase ────────────────────────────────────────────────────────
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, status, razorpay_order_id, razorpay_payment_id, total_amount, created_at"
    )
    .eq("id", id)
    .maybeSingle(); // returns null instead of throwing when no row is found

  // ── 3. Handle database error ─────────────────────────────────────────────────
  if (error) {
    console.error("[GET /api/order-status] Supabase error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order status." },
      { status: 500 }
    );
  }

  // ── 4. Handle not found ──────────────────────────────────────────────────────
  if (!order) {
    return NextResponse.json(
      { success: false, error: `Order with id "${id}" not found.` },
      { status: 404 }
    );
  }

  // ── 5. Return the order status ───────────────────────────────────────────────
  return NextResponse.json({
    success: true,
    id: order.id,
    status: order.status,
    razorpay_order_id: order.razorpay_order_id,
    razorpay_payment_id: order.razorpay_payment_id,
    total_amount: order.total_amount,
    created_at: order.created_at,
  });
}
