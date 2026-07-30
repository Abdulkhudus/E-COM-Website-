// app/api/cart/route.ts — placeholder
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ items: [] });
}

export async function POST() {
  return NextResponse.json({ message: "Item added" });
}
