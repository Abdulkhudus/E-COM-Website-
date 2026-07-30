// components/Footer.tsx
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="w-full py-8 px-6 text-center"
      style={{
        backgroundColor: "var(--color-foreground)",
        color: "var(--color-primary-foreground)",
      }}
    >
      <p
        className="text-lg font-semibold tracking-wide"
        style={{ color: "var(--color-primary)" }}
      >
        ShopWave
      </p>

      <p
        className="mt-2 text-sm opacity-60"
        style={{ color: "var(--color-muted)" }}
      >
        &copy; {year} ShopWave. All rights reserved.
      </p>
    </footer>
  );
}
