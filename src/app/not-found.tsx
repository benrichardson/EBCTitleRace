import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "var(--space-10) var(--gutter)" }}>
      <h1 style={{ fontFamily: "var(--font-display), sans-serif", textTransform: "uppercase" }}>Not found</h1>
      <p>That page isn’t in the current rankings.</p>
      <p>
        <Link href="/">Go to the rankings</Link>
      </p>
    </main>
  );
}
