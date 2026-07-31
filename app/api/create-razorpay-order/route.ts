import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!razorpay) {
    return NextResponse.json(
      { error: "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local." },
      { status: 503 }
    );
  }

  try {
    const { order_id } = await request.json();

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // 2) Fetch that order's total_amount from Supabase via lib/supabase.ts.
    const { data: order, error } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("id", order_id)
      .single();

    if (error || !order) {
      console.error("Error fetching order:", error);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 3) Create a Razorpay Order for that amount in paise (total_amount * 100).
    if (!order.total_amount || order.total_amount <= 0) {
      return NextResponse.json(
        { error: `Invalid order amount: ₹${order.total_amount}. Cannot create a Razorpay order.` },
        { status: 400 }
      );
    }
    const amountInPaise = Math.round(order.total_amount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order_id.toString(),
    });

    // 4) Save the Razorpay order id into razorpay_order_id on our Supabase order.
    const { error: updateError } = await supabase
      .from("orders")
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("id", order_id);

    if (updateError) {
      console.error("Error updating order with razorpay_order_id:", updateError);
      return NextResponse.json(
        { error: "Failed to update order with Razorpay order ID" },
        { status: 500 }
      );
    }

    // 5) Return the Razorpay order id and amount to the frontend.
    return NextResponse.json({
      razorpay_order_id: razorpayOrder.id,
      amount: amountInPaise,
    });
  } catch (error: any) {
    console.error("Error in create-razorpay-order:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
