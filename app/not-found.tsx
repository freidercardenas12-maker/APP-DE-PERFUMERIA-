import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-xs tracking-[0.22em] text-[#d4af37] uppercase">404</p>
      <h1 className="mt-3 font-serif text-5xl">No encontramos esa página</h1>
      <Link href="/" className="btn-gold mt-8">
        Volver al inicio
      </Link>
    </div>
  );
}
