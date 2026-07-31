import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    // 1) Receive razorpay_order_id, razorpay_payment_id, razorpay_signature.
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required Razorpay parameters" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Razorpay secret not configured" }, { status: 500 });
    }

    // 2) Recompute the expected signature using HMAC SHA256
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    // 3) & 4) Verify signature
    if (expectedSignature === razorpay_signature) {
      // Signature matches, update order status to 'paid'
      const { error } = await supabase
        .from("orders")
        .update({
          status: "paid",
          razorpay_payment_id: razorpay_payment_id,
        })
        .eq("razorpay_order_id", razorpay_order_id);

      if (error) {
        console.error("Error updating order status:", error);
        return NextResponse.json({ error: "Payment verified but failed to update order status" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Payment verified successfully" });
    } else {
      // Signature does not match, return an error
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error in verify-razorpay-payment:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
