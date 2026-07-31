// components/Hero.tsx
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      className="relative isolate overflow-hidden px-6 py-28 sm:py-36 lg:py-44"
      style={{
        background:
          "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 55%, var(--color-accent) 100%)",
      }}
    >
      {/* Decorative blurred blobs for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--color-accent)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--color-primary)" }}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight"
          style={{ color: "var(--color-primary-foreground)" }}
        >
          Discover Products{" "}
          <span className="block" style={{ color: "var(--color-secondary)" }}>
            You&rsquo;ll Love
          </span>
        </h1>

        {/* Subtext */}
        <p
          className="mt-6 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed opacity-90"
          style={{ color: "var(--color-primary-foreground)" }}
        >
          Curated collections, unbeatable prices, and lightning-fast delivery —
          your new favourite shopping destination starts here.
        </p>

        {/* CTA */}
        <div className="mt-10 flex justify-center gap-4">
          <a
            href="#products"
            className="inline-flex items-center rounded-full px-8 py-3.5 text-base font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: "var(--color-surface)",
              color: "var(--color-primary)",
              outlineColor: "var(--color-primary)",
            }}
          >
            Shop Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
