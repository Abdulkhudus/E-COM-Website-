// components/Hero.tsx
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="ml-2 h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 0 1 .75-.75h10.638l-3.96-3.96a.75.75 0 1 1 1.06-1.06l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06l3.96-3.96H3.75A.75.75 0 0 1 3 10Z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
