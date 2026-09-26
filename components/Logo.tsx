import Link from "next/link";

export function Logo({ variant = "header" }: { variant?: "header" | "full" }) {
  const className =
    variant === "full"
      ? "mx-auto h-auto w-full max-w-md"
      : "block h-auto w-32 sm:w-40";
  return (
    <Link href="/" className="inline-flex shrink-0" aria-label="Aura & Essentia, inicio">
      <img src="/logo.jpg" alt="Aura & Essentia" className={className} />
    </Link>
  );
}
