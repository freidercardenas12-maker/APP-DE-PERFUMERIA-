import { ProductGrid } from "@/components/ProductGrid";
import { getProducts } from "@/lib/store";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Buscar",
  description: "Busca perfumes por nombre en dama, caballero y árabe.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const products = query
    ? (await getProducts()).filter((product) => product.nombre.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-serif text-4xl md:text-6xl">Buscar</h1>
      <form action="/buscar" className="mt-6 flex max-w-xl gap-3">
        <input name="q" defaultValue={query} placeholder="Nombre del perfume" aria-label="Buscar" className="field" />
        <button type="submit" className="btn-gold">
          Buscar
        </button>
      </form>
      <p className="mt-6 text-sm text-[#e8d5a3]">
        {query ? `${products.length} resultados para “${query}”` : "Escribe un nombre para buscar en las tres líneas."}
      </p>
      {query && products.length === 0 ? (
        <div className="mt-8 border border-dashed border-[rgba(212,175,55,0.35)] px-6 py-12 text-center">
          <p>No hay un perfume con ese nombre.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/catalogo/dama" className="btn-ghost">
              Dama
            </Link>
            <Link href="/catalogo/caballero" className="btn-ghost">
              Caballero
            </Link>
            <Link href="/catalogo/arabe" className="btn-ghost">
              Árabe
            </Link>
          </div>
        </div>
      ) : null}
      <div className="mt-6">{query && products.length > 0 ? <ProductGrid products={products.slice(0, 48)} /> : null}</div>
    </div>
  );
}
