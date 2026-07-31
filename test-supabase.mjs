// Quick Supabase connection test — run with: node test-supabase.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Manually parse .env.local
const envPath = resolve(".env.local");
const lines = readFileSync(envPath, "utf-8").split(/\r?\n/);
for (const line of lines) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL:", JSON.stringify(url));
console.log("Anon key (first 20):", JSON.stringify(key?.slice(0, 20)));

const supabase = createClient(url, key);

// 1) List all products
const { data: all, error: allErr } = await supabase
  .from("products")
  .select("id, name, slug")
  .limit(10);

if (allErr) {
  console.error("Error listing products:", allErr);
} else {
  console.log("Products in DB:", all);
}

// 2) Fetch specific slug
const { data: single, error: singleErr } = await supabase
  .from("products")
  .select("*")
  .eq("slug", "minimalist-leather-watch")
  .single();

if (singleErr) {
  console.error("Error fetching slug:", singleErr);
} else {
  console.log("Product found:", single);
}
