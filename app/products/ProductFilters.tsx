"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useTransition } from "react";
import { Search, ChevronDown } from "lucide-react";

// ─── Categories list (mirrors API data) ──────────────────────────────────────

const CATEGORIES = ["All", "Audio", "Peripherals", "Displays", "Furniture", "Storage", "Accessories"];

// ─── ProductFilters ───────────────────────────────────────────────────────────

export default function ProductFilters({
  initialSearch,
  initialCategory,
}: {
  initialSearch: string;
  initialCategory: string;
}) {
  const router     = useRouter();
  const pathname   = usePathname();
  const params     = useSearchParams();
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function push(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "All") {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`);
    });
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => push("search", e.target.value), 350);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

      {/* Search bar */}
      <div className="relative flex-1">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
          <Search size={16} strokeWidth={2} />
        </span>
        <input
          id="product-search"
          type="search"
          placeholder="Search products…"
          defaultValue={initialSearch}
          onChange={handleSearch}
          className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
        />
      </div>

      {/* Category dropdown */}
      <div className="relative shrink-0">
        <select
          id="product-category"
          defaultValue={initialCategory || "All"}
          onChange={(e) => push("category", e.target.value)}
          className="w-full appearance-none rounded-xl border border-border bg-surface py-2.5 pl-4 pr-9 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition cursor-pointer sm:w-44"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
          <ChevronDown size={15} strokeWidth={2} />
        </span>
      </div>

    </div>
  );
}
