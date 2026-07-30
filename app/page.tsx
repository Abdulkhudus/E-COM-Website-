import { ShoppingBag } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-10">
      {/* ── TEMPORARY DESIGN-SYSTEM DEMO — remove once confirmed ── */}
      <section className="mx-auto max-w-lg space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">
          Design System Check
        </h1>

        {/* Color swatches */}
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className="h-12 w-20 rounded-lg bg-primary" />
            <span className="text-xs text-muted">primary</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-12 w-20 rounded-lg bg-secondary" />
            <span className="text-xs text-muted">secondary</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-12 w-20 rounded-lg bg-accent" />
            <span className="text-xs text-muted">accent</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-12 w-20 rounded-lg bg-success" />
            <span className="text-xs text-muted">success</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-12 w-20 rounded-lg bg-error" />
            <span className="text-xs text-muted">error</span>
          </div>
        </div>

        {/* Text on primary */}
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto">
          <ShoppingBag size={16} />
          Add to Cart
        </button>

        {/* Secondary variant */}
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-medium text-secondary-foreground transition-opacity hover:opacity-90 sm:w-auto">
          <ShoppingBag size={16} />
          Secondary Button
        </button>

        <p className="text-xs text-muted">
          Remove this demo block from app/page.tsx once confirmed.
        </p>
      </section>
    </main>
  );
}
